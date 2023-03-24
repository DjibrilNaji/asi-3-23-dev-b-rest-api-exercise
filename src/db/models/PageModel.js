import BaseModel from "./BaseModel.js"
import UserModel from "./UserModel.js"
import NavigationMenuModel from "./NavigationMenuModel.js"

class PageModel extends BaseModel {
  static tableName = "pages"

  static modifiers = {
    paginate: (query, limit, page) => {
      return query.limit(limit).offset((page - 1) * limit)
    },
  }

  static relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: "pages.userId",
          to: "users.id",
        },
      },
      updatedBy: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: "rel_users__pages.updatedBy",
          to: "users.id",
        },
      },
      relationToMenu: {
        relation: BaseModel.HasManyRelation,
        modelClass: NavigationMenuModel,
        join: {
          from: "pages.id",
          through: {
            from: "rel_navigation_menus__pages.pageId",
            to: "rel_navigation_menus__pages.menuId",
          },
          to: "navigation_menusId",
        },
      },
    }
  }
}

export default PageModel
