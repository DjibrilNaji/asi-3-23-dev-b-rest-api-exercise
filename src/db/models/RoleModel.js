import BaseModel from "./BaseModel.js"
import UserModel from "./UserModel.js"

class RoleModel extends BaseModel {
  static tableName = "roles"

  static modifiers = {
    paginate: (query, limit, page) => {
      return query.limit(limit).offset((page - 1) * limit)
    },
  }

  static relationMappings() {
    return {
      users: {
        relation: BaseModel.HasManyRelation,
        modelClass: UserModel,
        join: {
          from: "roles.id",
          to: "users.roleId",
        },
      },
    }
  }
}

export default RoleModel
