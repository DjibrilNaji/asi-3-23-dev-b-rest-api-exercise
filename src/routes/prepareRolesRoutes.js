import RoleModel from "../db/models/RoleModel.js"
import UserModel from "../db/models/UserModel.js"
import { InvalidArgumentError } from "../errors.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  idValidator,
  limitValidator,
  nameValidator,
  orderValidator,
  pageValidator,
  ressourcePermissionValidator,
  roleIdValidator,
} from "../validators.js"

const prepareRolesRoutes = ({ app, db }) => {
  app.get(
    "/roles",
    auth("roles", "R"),
    validate({
      query: {
        limit: limitValidator,
        page: pageValidator,
        order: orderValidator.default("asc"),
      },
    }),
    async (req, res) => {
      const { limit, page, order } = req.locals.query
      const roles = await RoleModel.query()
        .modify("paginate", limit, page)
        .orderBy("id", order)

      res.send({ result: roles })
    }
  )

  app.get(
    "/role/:roleId",
    auth("roles", "R"),
    validate({
      params: {
        roleId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const role = await RoleModel.query().findById(req.params.roleId)

      if (!role) {
        throw new InvalidArgumentError()
      }

      res.send({ result: role })
    }
  )

  app.post(
    "/roles",
    auth("roles", "C"),
    validate({
      body: {
        name: nameValidator.required(),
        permissions: ressourcePermissionValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { name, permissions },
      } = req.locals

      const role = await RoleModel.query().findOne({ name })

      if (role) {
        res.send({ result: "OK" })

        return
      }

      await db("roles").insert({
        name,
        permissions,
      })

      res.send({ result: "OK" })
    }
  )

  app.patch(
    "/role/:roleId",
    auth("roles", "U"),
    validate({
      params: {
        roleId: idValidator.required(),
      },
      body: {
        name: nameValidator,
        permissions: ressourcePermissionValidator,
      },
    }),
    async (req, res) => {
      const {
        body: { name, permissions },
      } = req.locals

      const role = await RoleModel.query().findById(req.params.roleId)

      if (!role) {
        throw new InvalidArgumentError()
      }

      const updatedRole = await RoleModel.query()
        .update({
          ...(name ? { name } : {}),
          ...(permissions ? { permissions } : {}),
        })
        .where({
          id: req.params.roleId,
        })
        .returning("*")

      res.send({ result: updatedRole })
    }
  )

  app.delete(
    "/role/:roleId",
    auth("roles", "D"),
    validate({
      params: {
        roleId: roleIdValidator.required(),
      },
    }),
    async (req, res) => {
      const role = await RoleModel.query().findById(req.params.roleId)

      console.log(role)

      if (!role) {
        throw new InvalidArgumentError()
      }

      await UserModel.query()
        .update({ roleId: 1 })
        .where({ roleId: req.params.roleId })

      await RoleModel.query().delete().where({
        id: req.params.roleId,
      })

      res.send({ result: role })
    }
  )
}

export default prepareRolesRoutes
