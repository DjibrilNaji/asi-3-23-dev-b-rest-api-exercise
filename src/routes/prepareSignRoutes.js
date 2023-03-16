import validate from "../middlewares/validate.js"
import UserModel from "../db/models/UserModel.js"
import RoleModel from "../db/models/RoleModel.js"
import hashPassword from "../db/hashPassword.js"
import {
  nameValidator,
  emailValidator,
  passwordValidator,
  stringValidator,
} from "../validators.js"
import auth from "../middlewares/auth.js"
import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"
import { InvalidAccessError, InvalidArgumentError } from "../errors.js"

const prepareSignRoutes = ({ app, db }) => {
  app.post(
    "/users",
    auth,
    validate({
      body: {
        email: emailValidator.required(),
        name: nameValidator.required(),
        firstName: nameValidator,
        lastName: nameValidator,
        password: passwordValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { email, name, firstName, lastName, password },
        session: { user: userSession },
      } = req.locals

      if (userSession.role !== "manager") {
        throw new InvalidAccessError()
      }

      const user = await UserModel.query().findOne({ email })

      if (user) {
        res.send({ result: "OK" })

        return
      }

      const role = await RoleModel.query().findOne({ name })

      if (!role) {
        throw new InvalidArgumentError()
      }

      const roleId = role.id

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
        res.status(401).send({ error: "Invalid credentials." })

        return
      }

      const [passwordHash] = await hashPassword(password, user.passwordSalt)

      if (passwordHash !== user.passwordHash) {
        res.status(401).send({ error: "Invalid credentials." })

        return
      }

      const jwt = jsonwebtoken.sign(
        {
          payload: {
            user: {
              id: user.id,
              role: user.name,
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
