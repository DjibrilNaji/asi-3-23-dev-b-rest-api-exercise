import validate from "../middlewares/validate.js"
import UserModel from "../db/models/UserModel.js"
import RoleModel from "../db/models/RoleModel.js"
import RelUsersPagesModel from "../db/models/RelUsersPagesModel.js"
import hashPassword from "../db/hashPassword.js"
import {
  nameValidator,
  emailValidator,
  passwordValidator,
  idValidator,
  limitValidator,
  pageValidator,
  orderValidator,
  roleIdValidator,
} from "../validators.js"
import auth from "../middlewares/auth.js"
import {
  InvalidAccessError,
  InvalidArgumentError,
  InvalidSessionError,
  NotFoundError,
} from "../errors.js"
import mw from "../middlewares/mw.js"
import PageModel from "../db/models/PageModel.js"
import RelNavigationMenusPagesModel from "../db/models/RelNavigationMenusPagesModel.js"

const prepareUsersRoutes = ({ app, db }) => {
  const checkIfUserExists = async (userId) => {
    const user = await UserModel.query().findById(userId)

    if (user) {
      return user
    }

    throw new NotFoundError()
  }

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
    "/users/:userId",
    validate({
      params: {
        userId: idValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const session = req.locals

      if (!session) {
        throw new InvalidAccessError()
      }

      const {
        session: { user: userSession },
      } = req.locals

      const { userId } = req.params

      const sessionRole = await RoleModel.query().findOne({
        name: userSession.role,
      })

      if (!sessionRole) {
        throw new InvalidArgumentError()
      }

      const permission = sessionRole.permissions.users

      if (!permission.includes("R") && userId != userSession.userId) {
        throw new InvalidAccessError()
      }

      const user = await UserModel.query().findById(userId)

      if (!user) {
        throw new InvalidArgumentError()
      }

      res.send({ result: user })
    })
  )

  app.post(
    "/users",
    auth("users", "C"),
    validate({
      body: {
        email: emailValidator.required(),
        roleId: roleIdValidator.required(),
        firstName: nameValidator,
        lastName: nameValidator,
        password: passwordValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { email, roleId, firstName, lastName, password },
      } = req.locals

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
    "/users/:userId",
    validate({
      params: {
        userId: idValidator.required(),
      },
      body: {
        email: emailValidator,
        roleId: roleIdValidator,
        firstName: nameValidator,
        lastName: nameValidator,
        password: passwordValidator,
      },
    }),
    mw(async (req, res) => {
      const session = req.locals

      if (!session) {
        throw new InvalidAccessError()
      }

      const {
        body: { email, roleId, firstName, lastName, password },
        session: { user: userSession },
      } = req.locals
      const { userId } = req.params

      const sessionRole = await RoleModel.query().findOne({
        name: userSession.role,
      })

      if (!sessionRole) {
        throw new InvalidArgumentError()
      }

      const permission = sessionRole.permissions.users

      if (!permission.includes("U") && userId != userSession.userId) {
        throw new InvalidAccessError()
      }

      const role = await RoleModel.query().findById(roleId)

      if (!role) {
        throw new InvalidArgumentError()
      }

      const user = await checkIfUserExists(userId, res)

      if (!user) {
        return
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
          id: userId,
        })
        .returning("*")

      res.send({ result: updatedUser })
    })
  )

  app.delete(
    "/users/:userId",
    validate({
      params: {
        userId: idValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const session = req.locals

      if (!session) {
        throw new InvalidAccessError()
      }

      const {
        session: { user: userSession },
      } = req.locals

      const { userId } = req.params

      const sessionRole = await RoleModel.query().findOne({
        name: userSession.role,
      })

      if (!sessionRole) {
        throw new InvalidSessionError()
      }

      const permission = sessionRole.permissions.users

      if (!permission.includes("D") && userId != userSession.userId) {
        throw new InvalidAccessError()
      }

      const user = await checkIfUserExists(userId, res)

      if (!user) {
        return
      }

      await RelUsersPagesModel.query()
        .delete()
        .where({
          updatedBy: userId,
        })
        .orWhereIn("pageId", function () {
          this.select("id").from("pages").where("creator", userId)
        })

      await RelNavigationMenusPagesModel.query()
        .delete()
        .whereIn("pageId", function () {
          this.select("id").from("pages").where("creator", userId)
        })
        .orWhereIn("parentId", function () {
          this.select("id").from("pages").where("creator", userId)
        })

      await PageModel.query().delete().where({
        creator: userId,
      })

      await UserModel.query().delete().where({
        id: userId,
      })

      res.send({ result: user })
    })
  )
}

export default prepareUsersRoutes
