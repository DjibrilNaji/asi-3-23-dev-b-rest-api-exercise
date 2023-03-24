import BaseModel from "./BaseModel.js"
import PageModel from "./PageModel.js"
import UserModel from "./UserModel.js"

class RelUsersPagesModel extends BaseModel {
  static tableName = "rel_users__pages"
  static relationMappings() {
    return {
      page: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: PageModel,
        join: {
          from: "rel_users__pages.pageId",
          to: "pages.id",
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
    }
  }
}

export default RelUsersPagesModel
