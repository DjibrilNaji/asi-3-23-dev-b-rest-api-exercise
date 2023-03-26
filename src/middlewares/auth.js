import RoleModel from "../db/models/RoleModel.js"
import { InvalidAccessError, InvalidSessionError } from "../errors.js"
import mw from "./mw.js"

const auth = (ressource, perm, self = false) =>
  mw(async (req, res, next) => {
    const session = req.locals

    if (!session) {
      throw new InvalidSessionError()
    }

    const {
      session: { user: userSession },
    } = req.locals

    const sessionRole = await RoleModel.query().findOne({
      name: userSession.role,
    })

    if (!sessionRole) {
      throw new InvalidSessionError()
    }

    const permission = userSession.permission[ressource]

    if (self) {
      const { userId } = req.params

      if (!permission.includes(perm) && userId != userSession.userId) {
        throw new InvalidAccessError()
      }
    } else {
      if (!permission.includes(perm)) {
        throw new InvalidAccessError()
      }
    }

    next()
  })

export default auth
