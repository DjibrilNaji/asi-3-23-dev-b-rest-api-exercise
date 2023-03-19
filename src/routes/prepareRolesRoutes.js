import RoleModel from "../db/models/RoleModel.js"
import { InvalidAccessError, InvalidArgumentError } from "../errors.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  idValidator,
  nameValidator,
  ressourcePermissionValidator,
} from "../validators.js"

const prepareRolesRoutes = ({ app, db }) => {
  app.get("/roles", auth, async (req, res) => {
    const {
      session: { user: userSession },
    } = req.locals

    const name = userSession.role
    const sessionRole = await RoleModel.query().findOne({ name })

    if (!sessionRole) {
      throw new InvalidArgumentError()
    }

    const permission = sessionRole.permissions.roles

    if (!permission.includes("R")) {
      throw new InvalidAccessError()
    }

    const roles = await RoleModel.query()

    res.send({ result: roles })
  })

  app.get(
    "/role/:roleId",
    auth,
    validate({
      params: {
        roleId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        session: { user: userSession },
      } = req.locals

      const sessionRoleName = userSession.role
      const sessionRole = await RoleModel.query().findOne({
        name: sessionRoleName,
      })

      if (!sessionRole) {
        throw new InvalidArgumentError()
      }

      const permission = sessionRole.permissions.roles

      if (!permission.includes("R")) {
        throw new InvalidAccessError()
      }

      const role = await RoleModel.query().findById(req.params.roleId)

      if (!role) {
        throw new InvalidArgumentError()
      }

      res.send({ result: role })
    }
  )

  app.post(
    "/role",
    auth,
    validate({
      body: {
        name: nameValidator.required(),
        permissions: ressourcePermissionValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { name, permissions },
        session: { user: userSession },
      } = req.locals

      const sessionRoleName = userSession.role
      const sessionRole = await RoleModel.query().findOne({
        name: sessionRoleName,
      })

      if (!sessionRole) {
        throw new InvalidArgumentError()
      }

      const permission = sessionRole.permissions.roles

      if (!permission.includes("C")) {
        throw new InvalidAccessError()
      }

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
    auth,
    validate({
      params: {
        roleId: idValidator.required(),
      },
      body: {
        name: nameValidator.required(),
        permissions: ressourcePermissionValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { name, permissions },
        session: { user: userSession },
      } = req.locals

      const sessionRoleName = userSession.role
      const sessionRole = await RoleModel.query().findOne({
        name: sessionRoleName,
      })

      if (!sessionRole) {
        throw new InvalidArgumentError()
      }

      const permission = sessionRole.permissions.roles

      if (!permission.includes("U")) {
        throw new InvalidAccessError()
      }

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
    auth,
    validate({
      params: {
        roleId: idValidator.required(),
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

      const permission = sessionRole.permissions.roles

      if (!permission.includes("D")) {
        throw new InvalidAccessError()
      }

      const role = await RoleModel.query().findById(req.params.roleId)

      if (!role) {
        throw new InvalidArgumentError()
      }

      await RoleModel.query().delete().where({
        id: req.params.roleId,
      })

      res.send({ result: role })
    }
  )
}

export default prepareRolesRoutes
