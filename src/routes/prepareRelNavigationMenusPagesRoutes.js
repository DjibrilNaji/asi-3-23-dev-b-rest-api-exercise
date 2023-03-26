import NavigationMenuModel from "../db/models/NavigationMenuModel.js"
import PageModel from "../db/models/PageModel.js"
import RelNavigationMenusPagesModel from "../db/models/RelNavigationMenusPagesModel.js"
import { InvalidArgumentError, NotFoundError } from "../errors.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  idValidator,
  limitValidator,
  orderValidator,
  pageValidator,
  ressourcesValidator,
} from "../validators.js"

const prepareRelNavigationMenusPagesRoutes = ({ app, db }) => {
  app.get(
    "/rel-navigations-pages",
    auth("rel_navigations_pages", "R"),
    validate({
      query: {
        limit: limitValidator,
        page: pageValidator,
        order: orderValidator.default("asc"),
      },
    }),
    async (req, res) => {
      const { limit, page, order } = req.locals.query
      const relNavPages = await RelNavigationMenusPagesModel.query()
        .innerJoin(
          "pages as p1",
          "rel_navigation_menus__pages.pageId",
          "=",
          "p1.id"
        )
        .leftJoin(
          "pages as p2",
          "rel_navigation_menus__pages.parentId",
          "=",
          "p2.id"
        )
        .innerJoin(
          "navigation_menus",
          "rel_navigation_menus__pages.menuId",
          "=",
          "navigation_menus.id"
        )
        .select(
          "rel_navigation_menus__pages.id",
          "rel_navigation_menus__pages.menuId",
          "navigation_menus.name as menu",
          "rel_navigation_menus__pages.pageId",
          "p1.title as page",
          "rel_navigation_menus__pages.parentId",
          "p2.title"
        )
        .modify("paginate", limit, page)
        .orderBy("id", order)

      res.send({ result: relNavPages })
    }
  )

  app.get(
    "/rel-navigations-pages/:ressource/:id",
    auth("rel_navigations_pages", "R"),
    validate({
      query: {
        limit: limitValidator,
        page: pageValidator,
        order: orderValidator.default("asc"),
      },
      params: {
        id: idValidator.required(),
        ressource: ressourcesValidator.required(),
      },
    }),
    async (req, res) => {
      const { limit, page, order } = req.locals.query

      const relNavPages = await RelNavigationMenusPagesModel.query()
        .innerJoin(
          "pages as p1",
          "rel_navigation_menus__pages.pageId",
          "=",
          "p1.id"
        )
        .leftJoin(
          "pages as p2",
          "rel_navigation_menus__pages.parentId",
          "=",
          "p2.id"
        )
        .innerJoin(
          "navigation_menus",
          "rel_navigation_menus__pages.menuId",
          "=",
          "navigation_menus.id"
        )
        .select(
          "rel_navigation_menus__pages.id",
          "rel_navigation_menus__pages.menuId",
          "navigation_menus.name as menu",
          "rel_navigation_menus__pages.pageId",
          "p1.title as page",
          "rel_navigation_menus__pages.parentId",
          "p2.title"
        )
        .where(
          req.params.ressource === "pages"
            ? { pageId: req.params.id }
            : { menuId: req.params.id }
        )
        .modify("paginate", limit, page)
        .orderBy("id", order)

      if (!relNavPages) {
        throw new NotFoundError()
      }

      res.send({ result: relNavPages })
    }
  )

  app.post(
    "/rel-navigations-pages",
    auth("rel_navigations_pages", "C"),
    validate({
      body: {
        menuId: idValidator,
        pageId: idValidator,
        parentId: idValidator,
      },
    }),
    async (req, res) => {
      const {
        body: { menuId, pageId, parentId },
      } = req.locals

      const menu = await NavigationMenuModel.query().findOne({ id: menuId })

      if (!menu) {
        throw new NotFoundError()
      }

      const page = await PageModel.query().findOne({ id: pageId })

      if (!page) {
        throw new NotFoundError()
      }

      const parent = await PageModel.query().findOne({ id: parentId })

      if (!parent) {
        throw new NotFoundError()
      }

      await db("rel_navigation_menus__pages").insert({
        menuId,
        pageId,
        parentId,
      })

      res.send({ result: "OK" })
    }
  )

  app.patch(
    "/rel-navigations-pages/:id",
    auth("rel_navigations_pages", "U"),
    validate({
      params: {
        id: idValidator.required(),
      },
      body: {
        menuId: idValidator,
        pageId: idValidator,
        parentId: idValidator,
      },
    }),
    async (req, res) => {
      const {
        body: { menuId, pageId, parentId },
      } = req.locals

      const menu = await NavigationMenuModel.query().findOne({ id: menuId })

      if (!menu) {
        throw new NotFoundError()
      }

      const page = await PageModel.query().findOne({ id: pageId })

      if (!page) {
        throw new NotFoundError()
      }

      const parent = await PageModel.query().findOne({ id: parentId })

      if (!parent) {
        throw new NotFoundError()
      }

      const relNavPage = await RelNavigationMenusPagesModel.query().findById(
        req.params.id
      )

      if (!relNavPage) {
        throw new InvalidArgumentError()
      }

      const relNavPageUpdated = await RelNavigationMenusPagesModel.query()
        .update({
          ...(menuId ? { menuId } : {}),
          ...(pageId ? { pageId } : {}),
          ...(parentId ? { parentId } : {}),
        })
        .where({
          id: req.params.id,
        })
        .returning("*")

      res.send({ result: relNavPageUpdated })
    }
  )

  app.delete(
    "/rel-navigations-pages/:id",
    auth("rel_navigations_pages", "D"),
    validate({
      params: {
        id: idValidator.required(),
      },
    }),
    async (req, res) => {
      const relNavPages = await RelNavigationMenusPagesModel.query().findById(
        req.params.id
      )

      if (!relNavPages) {
        throw new InvalidArgumentError()
      }

      await RelNavigationMenusPagesModel.query().delete().where({
        id: req.params.id,
      })

      res.send({ result: relNavPages })
    }
  )
}

export default prepareRelNavigationMenusPagesRoutes
