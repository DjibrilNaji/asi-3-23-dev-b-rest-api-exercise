import validate from "../middlewares/validate.js"
import UserModel from "../db/models/UserModel.js"
import RoleModel from "../db/models/RoleModel.js"
import hashPassword from "../db/hashPassword.js"
import {
  nameValidator,
  emailValidator,
  passwordValidator,
  idValidator,
  limitValidator,
  pageValidator,
  orderValidator,
} from "../validators.js"
import auth from "../middlewares/auth.js"
import { InvalidAccessError, InvalidArgumentError } from "../errors.js"

const prepareUsersRoutes = ({ app, db }) => {
  app.get(
    "/users",
    auth("users", "R"),
    validate({
      query: {
        limit: limitValidator,
        page: pageValidator,
        order: orderValidator.default("asc"),
      },
    }),
    async (req, res) => {
      const { limit, page, order } = req.locals.query

      const users = await UserModel.query()
        .orderBy("id", order)
        .modify("paginate", limit, page)

      res.send({ result: users })
    }
  )

  app.get(
    "/user/:userId",
    auth,
    validate({
      params: {
        userId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        session: { user: userSession },
      } = req.locals

      const name = userSession.role
      const sessionRole = await RoleModel.query().findOne({ name })

      if (!sessionRole) {
        throw new InvalidArgumentError()
      }

      const permission = sessionRole.permissions.users

      if (
        !permission.includes("R") &&
        req.params.userId != userSession.userId
      ) {
        throw new InvalidAccessError()
      }

      const user = await UserModel.query().findById(req.params.userId)

      if (!user) {
        throw new InvalidArgumentError()
      }

      res.send({ result: user })
    }
  )

  app.post(
    "/users",
    auth,
    validate({
      body: {
        email: emailValidator.required(),
        roleId: idValidator.required(),
        firstName: nameValidator,
        lastName: nameValidator,
        password: passwordValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { email, roleId, firstName, lastName, password },
        session: { user: userSession },
      } = req.locals

      const name = userSession.role
      const sessionRole = await RoleModel.query().findOne({ name })

      if (!sessionRole) {
        throw new InvalidArgumentError()
      }

      const permission = sessionRole.permissions.users

      if (!permission.includes("C")) {
        throw new InvalidAccessError()
      }

      const role = await RoleModel.query().findById(roleId)

      if (!role) {
        throw new InvalidArgumentError()
      }

      const user = await UserModel.query().findOne({ email })

      if (user) {
        res.send({ result: "OK" })

        return
      }

      const [passwordHash, passwordSalt] = await hashPassword(password)

      await db("users").insert({
        email,
        roleId,
        firstName,
        lastName,
        passwordHash,
        passwordSalt,
      })

      res.send({ result: "OK" })
    }
  )

  app.patch(
    "/user/:userId",
    auth,
    validate({
      params: {
        userId: idValidator.required(),
      },
      body: {
        email: emailValidator,
        roleId: idValidator,
        firstName: nameValidator,
        lastName: nameValidator,
        password: passwordValidator,
      },
    }),
    async (req, res) => {
      const {
        body: { email, roleId, firstName, lastName, password },
        session: { user: userSession },
      } = req.locals

      const name = userSession.role
      const sessionRole = await RoleModel.query().findOne({ name })

      if (!sessionRole) {
        throw new InvalidArgumentError()
      }

      const permission = sessionRole.permissions.users

      if (
        !permission.includes("U") &&
        req.params.userId != userSession.userId
      ) {
        throw new InvalidAccessError()
      }

      const role = await RoleModel.query().findById(roleId)

      if (!role) {
        throw new InvalidArgumentError()
      }

      const user = await UserModel.query().findById(req.params.userId)

      if (!user) {
        throw new InvalidArgumentError()
      }

      const [passwordHash, passwordSalt] = await hashPassword(password)

      const updatedUser = await UserModel.query()
        .update({
          ...(email ? { email } : {}),
          ...(permission.includes("C") && roleId ? { roleId } : {}),
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(passwordHash ? { passwordHash } : {}),
          ...(passwordSalt ? { passwordSalt } : {}),
        })
        .where({
          id: req.params.userId,
        })
        .returning("*")

      res.send({ result: updatedUser })
    }
  )

  app.delete(
    "/user/:userId",
    auth,
    validate({
      params: {
        userId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        session: { user: userSession },
      } = req.locals

      const name = userSession.role
      const sessionRole = await RoleModel.query().findOne({ name })

      if (!sessionRole) {
        throw new InvalidArgumentError()
      }

      const permission = sessionRole.permissions.users

      if (!permission.includes("D")) {
        throw new InvalidAccessError()
      }

      const user = await UserModel.query().findById(req.params.userId)

      if (!user) {
        throw new InvalidArgumentError()
      }

      await UserModel.query().delete().where({
        id: req.params.userId,
      })

      res.send({ result: user })
    }
  )
}

export default prepareUsersRoutes
