import { InvalidAccessError, InvalidSessionError } from "../errors.js"
import mw from "./mw.js"

const auth = (ressource, perm) =>
  mw(async (req, res, next) => {
    const session = req.locals

    if (!session) {
      throw new InvalidSessionError()
    }

    const {
      session: { user: userSession },
    } = req.locals

    const permission = userSession.permission[ressource]

    if (!permission.includes(perm)) {
      throw new InvalidAccessError()
    }

    next()
  })

export default auth
