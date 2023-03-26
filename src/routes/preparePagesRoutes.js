import NavigationMenuModel from "../db/models/NavigationMenuModel.js"
import RelNavigationMenusPagesModel from "../db/models/RelNavigationMenusPagesModel.js"
import RelUsersPagesModel from "../db/models/RelUsersPagesModel.js"
import PageModel from "../db/models/PageModel.js"
import { InvalidSessionError, NotFoundError } from "../errors.js"
import auth from "../middlewares/auth.js"
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import {
  contentValidator,
  idValidator,
  limitValidator,
  orderValidator,
  pageValidator,
  statusValidator,
  stringValidator,
  urlSlugValidator,
} from "../validators.js"

const preparePagesRoutes = ({ app, db }) => {
  app.get(
    "/pages",
    validate({
      query: {
        limit: limitValidator,
        page: pageValidator,
        order: orderValidator.default("asc"),
      },
    }),
    mw(async (req, res) => {
      const session = req.locals
      const { limit, page, order } = req.locals.query

      if (session) {
        const pages = await PageModel.query()
          .innerJoin("users", "pages.creator", "=", "users.id")
          .select(
            "pages.id",
            "pages.title",
            "pages.content",
            "pages.urlSlug",
            "pages.status",
            "users.firstName as creator"
          )
          .modify("paginate", limit, page)
          .orderBy("id", order)

        if (!pages) {
          throw new NotFoundError()
        }

        res.send({ result: pages })
      } else {
        const pages = await PageModel.query()
          .innerJoin("users", "pages.creator", "=", "users.id")
          .select(
            "pages.id",
            "pages.title",
            "pages.content",
            "pages.urlSlug",
            "pages.status",
            "users.firstName as creator"
          )
          .modify("paginate", limit, page)
          .where("pages.status", "=", "published")
          .orderBy("id", order)

        if (!pages) {
          throw new NotFoundError()
        }

        res.send({ result: pages })
      }
    })
  )

  app.get(
    "/pages/:pageId",
    validate({
      params: {
        pageId: idValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const session = req.locals

      if (session) {
        const page = await PageModel.query()
          .findById(req.params.pageId)
          .innerJoin("users", "pages.creator", "=", "users.id")
          .select(
            "pages.id",
            "pages.title",
            "pages.content",
            "pages.urlSlug",
            "pages.status",
            "users.firstName as creator"
          )

        if (!page) {
          throw new NotFoundError()
        }

        res.send({ result: page })
      } else {
        const page = await PageModel.query()
          .findById(req.params.pageId)
          .innerJoin("users", "pages.creator", "=", "users.id")
          .select(
            "pages.id",
            "pages.title",
            "pages.content",
            "pages.urlSlug",
            "pages.status",
            "users.firstName as creator"
          )
          .where("pages.status", "=", "published")

        if (!page) {
          throw new NotFoundError()
        }

        res.send({ result: page })
      }
    })
  )

  app.post(
    "/pages",
    auth("pages", "C"),
    validate({
      body: {
        title: stringValidator.required(),
        content: contentValidator.required(),
        urlSlug: urlSlugValidator.required(),
        status: statusValidator.required(),
        menuId: idValidator.required(),
        parentId: idValidator,
      },
    }),
    async (req, res) => {
      const {
        body: { title, content, urlSlug, status, menuId, parentId },
        session: { user: userSession },
      } = req.locals

      const navigationMenu = await NavigationMenuModel.query().findById(menuId)

      if (!navigationMenu) {
        throw new NotFoundError()
      }

      const page = await PageModel.query().findOne({
        urlSlug,
      })

      if (page) {
        res.send({ result: "OK" })

        return
      }

      await db("pages").insert({
        title,
        content,
        urlSlug,
        creator: userSession.userId,
        status,
      })

      const pageAfterInsert = await PageModel.query().findOne({
        urlSlug,
      })

      await db("rel_navigation_menus__pages").insert({
        menuId,
        pageId: pageAfterInsert.id,
        parentId,
      })

      res.send({ result: "OK" })
    }
  )

  app.patch(
    "/pages/:pageId",
    validate({
      params: {
        pageId: idValidator.required(),
      },
      body: {
        title: stringValidator.required(),
        content: contentValidator.required(),
        urlSlug: urlSlugValidator.required(),
        status: statusValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const session = req.locals

      if (!session) {
        throw new InvalidSessionError()
      }

      const {
        body: { title, content, urlSlug, status },
        session: { user: userSession },
      } = req.locals
      const { pageId } = req.params

      const page = await PageModel.query().findById(pageId)

      if (!page) {
        throw new NotFoundError()
      }

      const updatedPage = await PageModel.query()
        .update({
          ...(title ? { title } : {}),
          ...(content ? { content } : {}),
          ...(userSession.permission.pages.includes("C") && urlSlug
            ? { urlSlug }
            : {}),
          ...(status ? { status } : {}),
        })
        .where({
          id: req.params.pageId,
        })
        .returning("*")

      await db("rel_users__pages").insert({
        pageId: page.id,
        updatedBy: userSession.userId,
      })

      res.send({ result: updatedPage })
    })
  )

  app.delete(
    "/pages/:pageId",
    auth("pages", "D"),
    validate({
      params: {
        pageId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { pageId } = req.params

      const page = await PageModel.query().findById(pageId)

      if (!page) {
        throw new NotFoundError()
      }

      await RelNavigationMenusPagesModel.query()
        .delete()
        .where("pageId", pageId)
        .orWhere("parentId", pageId)

      await RelUsersPagesModel.query().delete().where({
        pageId: pageId,
      })

      await PageModel.query()
        .delete()
        .where("id", pageId)
        .orWhereIn("id", function () {
          this.select("pageId")
            .from("rel_navigation_menus__pages")
            .where("parentId", pageId)
        })

      res.send({ result: page })
    }
  )
}

export default preparePagesRoutes
