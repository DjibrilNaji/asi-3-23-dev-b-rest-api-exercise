import prepareNavigationMenusRoutes from "./routes/prepareNavigationMenusRoutes.js"
import preparePagesRoutes from "./routes/preparePagesRoutes.js"
import prepareRelNavigationMenusPagesRoutes from "./routes/prepareRelNavigationMenusPagesRoutes.js"
import prepareRolesRoutes from "./routes/prepareRolesRoutes.js"
import prepareSignRoutes from "./routes/prepareSignRoutes.js"
import prepareUsersRoutes from "./routes/prepareUsersRoutes.js"

const prepareRoutes = (ctx) => {
  prepareSignRoutes(ctx)
  prepareUsersRoutes(ctx)
  prepareRolesRoutes(ctx)
  prepareNavigationMenusRoutes(ctx)
  preparePagesRoutes(ctx)
  prepareRelNavigationMenusPagesRoutes(ctx)
}

export default prepareRoutes
