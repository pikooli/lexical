export const convertKebabCaseToCamelCase = (str: string | undefined) => {
  if (!str) return ''
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

export const convertCamelCaseToKebabCase = (str: string | undefined) => {
  if (!str) return ''
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}
