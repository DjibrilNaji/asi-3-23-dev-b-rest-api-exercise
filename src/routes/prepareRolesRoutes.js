import RoleModel from "../db/models/RoleModel.js"
import { InvalidAccessError, InvalidArgumentError } from "../errors.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import { idValidator } from "../validators.js"

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

      const name = userSession.role
      const sessionRole = await RoleModel.query().findOne({ name })

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
}

export default prepareRolesRoutes
