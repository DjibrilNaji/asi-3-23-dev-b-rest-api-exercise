import * as yup from "yup"
import config from "./config.js"

// generic
export const idValidator = yup.number().integer().min(1)

export const stringValidator = yup.string()

export const nameValidator = yup.string().min(1)

// pages
export const titleValidator = yup.string().min(1).max(300)

export const contentValidator = yup.string().min(1)

export const statusValidator = yup
  .string()
  .lowercase()
  .oneOf(["published", "draft"])

export const urlSlugValidator = yup
  .string()
  .matches(
    /^[a-z]+[a-z-]*$/,
    "The URL cannot contain any capital letters, any numbers, any special characters except '-' to separate certain words"
  )

// users and permissions
export const emailValidator = yup.string().email()

export const passwordValidator = yup
  .string()
  .min(8)
  .matches(
    /^(?=.*[\p{Ll}])(?=.*[\p{Lu}])(?=.*[0-9])(?=.*[^0-9\p{Lu}\p{Ll}]).*$/gu,
    "Password must contain at least 1 upper & 1 lower case letters, 1 digit, 1 spe. character"
  )

const permissionValidator = yup
  .string()
  .matches(
    /^(?!.*([CRUD]).*\1)[CRUD]*$/,
    "Permission must only contain at least one permission among CRUD"
  )

export const ressourcePermissionValidator = yup.object({
  users: permissionValidator,
  roles: permissionValidator,
  pages: permissionValidator,
  navigation_menu: permissionValidator,
})

// Pagination
export const limitValidator = yup
  .number()
  .integer()
  .min(config.pagination.limit.min)
  .max(config.pagination.limit.max)
  .default(config.pagination.limit.default)

export const pageValidator = yup.number().integer().min(0).default(1)

export const orderValidator = yup.string().lowercase().oneOf(["asc", "desc"])
