import * as yup from "yup"

export const idValidator = yup.number().integer().min(1)

export const emailValidator = yup.string().email()

export const stringValidator = yup.string()

// name and firstName
export const nameValidator = yup.string().min(1)

export const passwordValidator = yup
  .string()
  .min(8)
  .matches(
    /^(?=.*[\p{Ll}])(?=.*[\p{Lu}])(?=.*[0-9])(?=.*[^0-9\p{Lu}\p{Ll}]).*$/gu,
    "Password must contain at least 1 upper & 1 lower case letters, 1 digit, 1 spe. character"
  )
