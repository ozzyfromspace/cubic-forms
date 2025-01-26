import type { FlatPath, GenericForm } from '@/utils/types'

export const useFormValue = <Form extends GenericForm>(form: Form) => {
  return {
    getValue,
  }
}

function getValue<Form extends GenericForm>(): Form
function getValue<Form extends GenericForm, Path extends FlatPath<Form>>(
  path: Path,
): Form
function getValue() {}
