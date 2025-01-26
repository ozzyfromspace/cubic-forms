import type { FormKey, FormStore } from '@/types'
import { getValueFactory } from '@/utils/get-value'
import {
  getHandleSubmitFactory,
  getValidateFactory,
} from '@/utils/process-form'
import { setValueFactory } from '@/utils/set-value'
import type { GenericForm } from '@/utils/types'
import { useStateShim } from '@/utils/usestate-shim'
import { Ref, computed } from 'vue'

export function getForm<Form extends GenericForm>(
  formStore: Ref<FormStore<Form>>,
  formKey: FormKey,
) {
  const form = formStore.value.get(formKey)

  if (!form) {
    throw new Error(`Form with key '${formKey}' not registered`)
  }

  return form
}
export const useFormStore = <Form extends GenericForm>(formKey: FormKey) => {
  const formStore = useStateShim<FormStore<Form>>(
    'useform/store',
    () => new Map(),
  )

  function registerForm(form: Form) {
    if (formStore.value.has(formKey)) return

    formStore.value.set(formKey, form)
  }

  const form = computed(() => getForm(formStore, formKey))

  return {
    getHandleSubmitFactory,
    getValidateFactory,
    getValueFactory,
    setValueFactory,
    registerForm,
    formStore,
    form,
  }
}
