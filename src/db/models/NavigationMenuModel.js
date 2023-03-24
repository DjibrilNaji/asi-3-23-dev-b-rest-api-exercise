import BaseModel from "./BaseModel.js"
import PageModel from "./PageModel.js"

class NavigationMenuModel extends BaseModel {
  static tableName = "navigation_menus"

  static modifiers = {
    paginate: (query, limit, page) => {
      return query.limit(limit).offset((page - 1) * limit)
    },
  }

  static relationMappings() {
    return {
      pages: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: PageModel,
        join: {
          from: "navigation_menus.id",
          through: {
            from: "rel_navigation_menus__pages.menuId",
            to: "rel_navigation_menus__pages.pageId",
          },
          to: "pages.id",
        },
      },
    }
  }
}

export default NavigationMenuModel
