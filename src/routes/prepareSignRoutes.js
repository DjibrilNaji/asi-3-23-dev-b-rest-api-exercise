import validate from "../middlewares/validate.js"
import hashPassword from "../db/hashPassword.js"
import { emailValidator, stringValidator } from "../validators.js"
import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"
import { InvalidCredentialsError } from "../errors.js"

const prepareSignRoutes = ({ app, db }) => {
  app.post(
    "/sign-in",
    validate({
      body: {
        email: emailValidator.required(),
        password: stringValidator.required(),
      },
    }),
    async (req, res) => {
      const { email, password } = req.locals.body
      const [user] = await db("users")
        .where({ email })
        .innerJoin("roles", "users.roleId", "roles.id")

      if (!user) {
        throw new InvalidCredentialsError()
      }

      const [passwordHash] = await hashPassword(password, user.passwordSalt)

      if (passwordHash !== user.passwordHash) {
        throw new InvalidCredentialsError()
      }

      const jwt = jsonwebtoken.sign(
        {
          payload: {
            user: {
              userId: user.id,
              role: user.name,
              permission: user.permissions,
            },
          },
        },

        config.security.jwt.secret,
        config.security.jwt.options
      )

      res.send({ result: jwt })
    }
  )
}

export default prepareSignRoutes
