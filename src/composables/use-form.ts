import type { AbstractSchema, UseFormConfiguration } from '@/types'
import { getComputedSchema } from '@/utils/get-computed-schema'
import type { DeepPartial, GenericForm } from '@/utils/types'
import { useFormKey } from './use-form-key'
import { useFormStore } from './use-form-store'

export const useForm = <
  Form extends GenericForm,
  GetValueFormType extends GenericForm = Form,
>(
  configuration: UseFormConfiguration<
    Form,
    GetValueFormType,
    AbstractSchema<Form, GetValueFormType>,
    DeepPartial<Form>
  >,
) => {
  const { schema } = configuration
  const key = useFormKey(configuration.key)
  const computedSchema = getComputedSchema(key, schema)
  const initialStateResponse = computedSchema.getInitialState({
    useDefaultSchemaValues: true,
    constraints: configuration.initialState,
    validationMode: configuration.validationMode ?? 'lax',
  })

  const {
    getHandleSubmitFactory,
    getValidateFactory,
    getValueFactory,
    setValueFactory,
    registerForm,
    form,
    formStore,
  } = useFormStore<Form>(key)
  registerForm(initialStateResponse.data)

  const getValue = getValueFactory<Form, GetValueFormType>(form)
  const setValue = setValueFactory(formStore, key, computedSchema)
  const validate = getValidateFactory(form, key, computedSchema)
  const handleSubmit = getHandleSubmitFactory(form, validate)

  return {
    handleSubmit,
    getValue,
    setValue,
    validate,
    key,
  }
}
