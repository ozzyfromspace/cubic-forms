import { produce } from 'immer'
import _ from 'lodash'
import { Ref, toRaw } from 'vue'
import { getForm } from '../composables/use-form-store'
import type { AbstractSchema, FormKey, FormStore } from '../types'
import type { DeepPartial, FlatPath, GenericForm, NestedType } from './types'

type SetValueCallback<Payload> = (
  value: DeepPartial<Payload>,
) => DeepPartial<Payload>
type SetValuePayload<Payload> = DeepPartial<Payload> | SetValueCallback<Payload>

// setValue operations always REPLACE at the given path
export function setValueFactory<Form extends GenericForm>(
  formStore: Ref<FormStore<Form>>,
  formKey: FormKey,
  schema: AbstractSchema<Form, Form>,
) {
  function setValueWithCallbackAtRoot<Callback extends SetValueCallback<Form>>(
    callback: Callback,
  ): boolean {
    // did this for type safety
    let success = false
    const updateSuccess = (newState: boolean) => {
      success = newState
    }
    const getSuccess = () => success

    const form = getForm(formStore, formKey)
    const updatedFormValue = produce(toRaw(form), (draft) => {
      try {
        const rawValue = callback(draft as DeepPartial<Form>)
        const { data: newForm, success } = schema.getInitialState({
          useDefaultSchemaValues: false,
          constraints: rawValue,
          validationMode: 'lax', // always relax the schema validation during setValue calls (assume input is a draft)
        })

        updateSuccess(success)

        // We're operating at the root, so clear draft manually
        for (const key of Object.keys(draft)) {
          _.unset(draft, key)
        }

        for (const [key, value] of Object.entries(newForm)) {
          _.set(draft, key, value)
        }
      } catch (error) {
        const errorMessage = (error as Error)?.message
        const display = errorMessage
          ? `\n\tMessage: ${errorMessage}`
          : ' Unknown Error.'
        console.warn(
          `setValue callback threw error while computing next root state.${display}`,
        )
        return
      }
    })

    for (const [key, value] of Object.entries(updatedFormValue) as [
      keyof Form,
      Form[keyof Form],
    ][]) {
      form[key] = value
    }

    return getSuccess()
  }

  function setValueWithCallbackAtPath<
    Path extends FlatPath<Form>,
    Callback extends SetValueCallback<NestedType<Form, Path>>,
  >(path: Path, callback: Callback): boolean {
    // I did this for type safety
    let success = false
    const updateSuccess = (newState: boolean) => {
      success = newState
    }
    const getSuccess = () => success

    const form = getForm(formStore, formKey)
    const nestedSchemas = schema.getSchemasAtPath(path)
    if (!nestedSchemas.length) {
      console.warn(`Nested schema not found for path '${path}'`)
      return false
    }

    const NOT_FOUND = Symbol()

    for (const nestedSchema of nestedSchemas) {
      const updatedValue = produce(toRaw(form), (draftForm) => {
        let defaultValue: unknown
        let valueAtPath = _.get(draftForm, path, NOT_FOUND)
        if (valueAtPath === NOT_FOUND) {
          try {
            const { data } = nestedSchema.getInitialState({
              useDefaultSchemaValues: false,
              constraints: undefined,
              validationMode: 'lax',
            })
            defaultValue = data
          } catch (error) {
            console.error(
              `Upstream library threw error in a nested schema's getInitialState implementation, related to form with key '${formKey}' at path '${path}'.`,
            )
            return
          }
        }

        const arg = (
          valueAtPath === NOT_FOUND ? defaultValue : valueAtPath
        ) as DeepPartial<NestedType<Form, typeof path>>

        try {
          const constraints = callback(arg)
          const { data: newState } = nestedSchema.getInitialState({
            useDefaultSchemaValues: false,
            constraints,
            validationMode: 'lax', // always relax the schema validation during setValue calls (reason: assume user's not done updating value)
          })

          _.set(draftForm, path, newState)
          updateSuccess(true)
          return
        } catch (error) {
          const errorMessage = (error as Error)?.message
          const display = errorMessage
            ? `\n\tMessage: ${errorMessage}`
            : ' Unknown Error.'
          console.error(
            `setValue callback threw Error while computing next value.${display}`,
          )
          return
        }
      })

      const successState = getSuccess()
      if (!successState) continue

      try {
        const { data: validatedNextState } = schema.getInitialState({
          useDefaultSchemaValues: false,
          constraints: updatedValue as DeepPartial<Form>,
          validationMode: 'lax', // always relax the schema validation during setValue calls (assume input is a draft)
        })
        formStore.value.set(formKey, validatedNextState)
        return true
      } catch (error) {
        const message = (error as Error)?.message
        const display = message ? `:\n\tMessage: ${message}` : '.'
        console.error(`Failed to update form with key '${formKey}'${display}`)
        continue // try again with another matching schema
      }
    }

    return false
  }

  function setValue<Value extends SetValuePayload<Form>>(value: Value): boolean
  function setValue<
    Path extends FlatPath<Form>,
    Value extends SetValuePayload<NestedType<Form, Path>>,
  >(path: Path, value: Value): boolean
  function setValue<
    Path extends FlatPath<Form>,
    RootValue extends SetValuePayload<Form>,
    NestedValue extends SetValuePayload<NestedType<Form, Path>>,
  >(pathOrValue: Path | RootValue, value?: NestedValue) {
    const ensureFunction = <T extends unknown>(val: T) => {
      if (_.isFunction(val)) return val as SetValueCallback<T>
      return (() => val) as SetValueCallback<T>
    }

    // nested form update
    if (typeof pathOrValue === 'string') {
      const callback = ensureFunction(value as NestedType<Form, Path>)
      return setValueWithCallbackAtPath(pathOrValue, callback)
    }

    // root callback update
    if (_.isFunction(pathOrValue)) {
      return setValueWithCallbackAtRoot(pathOrValue)
    }

    // root callback update
    if (_.isObjectLike(pathOrValue)) {
      const callback = ensureFunction(pathOrValue as unknown as Form)
      return setValueWithCallbackAtRoot(callback)
    }

    return false
  }

  return setValue
}

export function isPrimitive(input: unknown): boolean {
  if (typeof input === 'bigint') return true
  if (typeof input === 'boolean') return true
  if (typeof input === 'number') return true
  if (typeof input === 'string') return true
  if (typeof input === 'undefined') return true
  if (input === null) return true
  return false
}
