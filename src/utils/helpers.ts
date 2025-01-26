export const isRecord = (input: unknown): input is typeof input => {
  if (input !== null && typeof input === 'object') return true
  return false
}

export const isArray = (input: unknown): input is typeof input => {
  return Array.isArray(input)
}

export const isArrayOrRecord = (
  input: unknown,
): input is Array<unknown> | Record<string, unknown> => {
  return isRecord(input) || isArray(input)
}
