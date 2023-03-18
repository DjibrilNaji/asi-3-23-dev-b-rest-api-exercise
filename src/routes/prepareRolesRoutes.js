import RoleModel from "../db/models/RoleModel.js"
import { InvalidAccessError, InvalidArgumentError } from "../errors.js"
import auth from "../middlewares/auth.js"

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
}

export default prepareRolesRoutes
