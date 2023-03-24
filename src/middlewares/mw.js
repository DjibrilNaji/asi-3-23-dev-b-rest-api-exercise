import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"

const mw = (handle) => async (req, res, next) => {
  const jwt = req.headers.authorization?.slice(7)

  try {
    if (jwt) {
      const { payload } = jsonwebtoken.verify(jwt, config.security.jwt.secret)
      req.locals.session = payload
    } else {
      req.locals = ""
    }

    await handle(req, res, next)
  } catch (err) {
    next(err)
  }
}

export default mw
