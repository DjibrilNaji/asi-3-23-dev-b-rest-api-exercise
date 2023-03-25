import prepareNavigationMenusRoutes from "./routes/prepareNavigationMenusRoutes.js"
import prepareRolesRoutes from "./routes/prepareRolesRoutes.js"
import prepareSignRoutes from "./routes/prepareSignRoutes.js"
import prepareUsersRoutes from "./routes/prepareUsersRoutes.js"

const prepareRoutes = (ctx) => {
  prepareSignRoutes(ctx)
  prepareUsersRoutes(ctx)
  prepareRolesRoutes(ctx)
  prepareNavigationMenusRoutes(ctx)
}

export default prepareRoutes
