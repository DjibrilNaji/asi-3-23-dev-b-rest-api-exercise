import BaseModel from "./BaseModel.js"
import NavigationMenuModel from "./NavigationMenuModel.js"
import PageModel from "./PageModel.js"

class RelNavigationMenusPagesModel extends BaseModel {
  static tableName = "rel_navigation_menus__pages"

  static modifiers = {
    paginate: (query, limit, page) => {
      return query.limit(limit).offset((page - 1) * limit)
    },
  }

  static relationMappings() {
    return {
      menu: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: NavigationMenuModel,
        join: {
          from: "rel_navigation_menus__pages.menu_id",
          to: "navigation_menus.id",
        },
      },
      page: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: PageModel,
        join: {
          from: "rel_navigation_menus__pages.page_id",
          to: "pages.id",
        },
      },
      parentPage: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: PageModel,
        join: {
          from: "rel_navigation_menus__pages.parent_id",
          to: "pages.id",
        },
      },
    }
  }
}

export default RelNavigationMenusPagesModel
