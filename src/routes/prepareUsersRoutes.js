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
} from "../validators.js"
import auth from "../middlewares/auth.js"
import { InvalidArgumentError, NotFoundError } from "../errors.js"
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
        .innerJoin("roles", "users.roleId", "=", "roles.id")
        .select(
          "users.id",
          "users.email",
          "roles.name as role",
          "users.firstName",
          "users.lastName",
          "users.createdAt",
          "users.updatedAt"
        )
        .orderBy("id", order)
        .modify("paginate", limit, page)

      res.send({ result: users })
    }
  )

  app.get(
    "/users/:userId",
    auth("users", "R", true),
    validate({
      params: {
        userId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { userId } = req.params

      const user = await UserModel.query()
        .findById(userId)
        .innerJoin("roles", "users.roleId", "=", "roles.id")
        .select(
          "users.id",
          "users.email",
          "roles.name as role",
          "users.firstName",
          "users.lastName",
          "users.createdAt",
          "users.updatedAt"
        )

      if (!user) {
        throw new InvalidArgumentError()
      }

      res.send({ result: user })
    }
  )

  app.post(
    "/users",
    auth("users", "C"),
    validate({
      body: {
        email: emailValidator.required(),
        roleId: idValidator.required(),
        firstName: nameValidator.required(),
        lastName: nameValidator.required(),
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
    auth("users", "U", true),
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
      const { userId } = req.params

      const user = await checkIfUserExists(userId, res)

      if (!user) {
        return
      }

      const [passwordHash, passwordSalt] = await hashPassword(password)

      const updatedUser = await UserModel.query()
        .update({
          ...(email ? { email } : {}),
          ...(userSession.permission.users.includes("C") && roleId
            ? { roleId }
            : {}),
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
    }
  )

  app.delete(
    "/users/:userId",
    auth("users", "D", true),
    validate({
      params: {
        userId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { userId } = req.params

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
    }
  )
}

export default prepareUsersRoutes
