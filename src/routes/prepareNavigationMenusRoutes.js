import NavigationMenuModel from "../db/models/NavigationMenuModel.js"
import PageModel from "../db/models/PageModel.js"
import RelNavigationMenusPagesModel from "../db/models/RelNavigationMenusPagesModel.js"
import RelUsersPagesModel from "../db/models/RelUsersPagesModel.js"
import { NotFoundError } from "../errors.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  idValidator,
  limitValidator,
  nameValidator,
  orderValidator,
  pageValidator,
} from "../validators.js"

const prepareNavigationMenusRoutes = ({ app, db }) => {
  app.get(
    "/navigation-menus",
    validate({
      query: {
        limit: limitValidator,
        page: pageValidator,
        order: orderValidator.default("asc"),
      },
    }),
    async (req, res) => {
      const { limit, page, order } = req.locals.query

      const navigationMenus = await NavigationMenuModel.query()
        .modify("paginate", limit, page)
        .orderBy("id", order)

      if (!navigationMenus) {
        throw new NotFoundError()
      }

      res.send({ result: navigationMenus })
    }
  )

  app.get(
    "/navigation-menus/:navigationMenuId",
    validate({
      params: {
        navigationMenuId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const navigationMenu = await NavigationMenuModel.query().findById(
        req.params.navigationMenuId
      )

      if (!navigationMenu) {
        throw new NotFoundError()
      }

      res.send({ result: navigationMenu })
    }
  )

  app.post(
    "/navigation-menus",
    auth("navigation_menus", "C"),
    validate({
      body: {
        name: nameValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { name },
      } = req.locals

      const navigationMenu = await NavigationMenuModel.query().findOne({
        name,
      })

      if (navigationMenu) {
        res.send({ result: "Already exists" })

        return
      }

      const newNavigationMenuawait = await db("navigation_menus")
        .insert({
          name,
        })
        .returning("*")

      res.send({ result: newNavigationMenuawait })
    }
  )

  app.patch(
    "/navigation-menus/:navigationMenuId",
    auth("navigation_menus", "U"),
    validate({
      params: {
        navigationMenuId: idValidator.required(),
      },
      body: {
        name: nameValidator,
      },
    }),
    async (req, res) => {
      const {
        body: { name },
      } = req.locals

      const navigationMenu = await NavigationMenuModel.query().findById(
        req.params.navigationMenuId
      )

      if (!navigationMenu) {
        throw new NotFoundError()
      }

      const updatedNavigationMenu = await NavigationMenuModel.query()
        .update({
          ...(name ? { name } : {}),
        })
        .where({
          id: req.params.navigationMenuId,
        })
        .returning("*")

      res.send({ result: updatedNavigationMenu })
    }
  )

  // Delete a menu, return to delete all the pages that have it as a parent
  app.delete(
    "/navigation-menus/:navigationMenuId",
    auth("navigation_menus", "D"),
    validate({
      params: {
        navigationMenuId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { navigationMenuId } = req.params
      const navigationMenu = await NavigationMenuModel.query().findById(
        navigationMenuId
      )

      if (!navigationMenu) {
        throw new NotFoundError()
      }

      const pageIdsToDelete = await RelNavigationMenusPagesModel.query()
        .select("pageId", "parentId")
        .where("menuId", navigationMenuId)

      // To remove null values in the pageIdsToDelete array
      const flatPageIds = pageIdsToDelete
        .map(({ pageId, parentId }) => [pageId, parentId])
        .flat()
        .filter((id) => typeof id === "number")

      await RelUsersPagesModel.query()
        .delete()
        .whereIn("pageId", function () {
          this.select("pageId")
            .from("rel_navigation_menus__pages")
            .where("menuId", navigationMenuId)
        })

      await RelNavigationMenusPagesModel.query()
        .delete()
        .whereIn("pageId", function () {
          this.select("pageId")
            .from("rel_navigation_menus__pages")
            .where("menuId", navigationMenuId)
        })
        .orWhereIn("parentId", function () {
          this.select("pageId")
            .from("rel_navigation_menus__pages")
            .where("menuId", navigationMenuId)
        })

      await PageModel.query().delete().whereIn("id", flatPageIds)

      await RelNavigationMenusPagesModel.query().delete().where({
        menuId: navigationMenuId,
      })

      await NavigationMenuModel.query().delete().where({
        id: navigationMenuId,
      })

      res.send({ result: navigationMenu })
    }
  )
}

export default prepareNavigationMenusRoutes
