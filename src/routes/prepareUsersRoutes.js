import validate from "../middlewares/validate.js"
import UserModel from "../db/models/UserModel.js"
import RoleModel from "../db/models/RoleModel.js"
import hashPassword from "../db/hashPassword.js"
import {
  nameValidator,
  emailValidator,
  passwordValidator,
} from "../validators.js"
import auth from "../middlewares/auth.js"
import { InvalidAccessError, InvalidArgumentError } from "../errors.js"

const prepareUsersRoutes = ({ app, db }) => {
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

      if (userSession.role !== "admin") {
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
}

export default prepareUsersRoutes
