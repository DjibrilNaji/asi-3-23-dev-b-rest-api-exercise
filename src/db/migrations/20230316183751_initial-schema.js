export const up = async (knex) => {
  await knex.schema.createTable("roles", (table) => {
    table.increments("id")
    table.string("name").notNullable()
    table.json("permissions").notNullable()
  })

  await knex.schema.createTable("users", (table) => {
    table.increments("id")
    table.text("email").notNullable()
    table.integer("roleId").references("id").inTable("roles")
    table.text("firstName").notNullable()
    table.text("lastName").notNullable()
    table.text("passwordHash").notNullable()
    table.text("passwordSalt").notNullable()
    table.timestamps(true, true, true)
  })

  await knex.schema.createTable("pages", (table) => {
    table.increments("id")
    table.string("title").notNullable()
    table.text("content").notNullable()
    table.string("urlSlug").unique().notNullable()
    table.integer("creator").references("id").inTable("users")
    table.timestamp("publishedAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"))
    table.string("status").notNullable()
  })

  await knex.schema.createTable("rel_users__pages", (table) => {
    table.increments("id")
    table.integer("pageId").references("id").inTable("pages").notNullable()
    table.integer("updatedBy").references("id").inTable("users").notNullable()
    table.timestamp("updatedAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"))
  })

  await knex.schema.createTable("navigation_menus", (table) => {
    table.increments("id")
    table.string("name").notNullable()
  })

  await knex.schema.createTable("rel_navigation_menus__pages", (table) => {
    table.increments("id")
    table.integer("menuId").references("id").inTable("navigation_menus")
    table.integer("pageId").references("id").inTable("pages")
    table.integer("parentId").references("id").inTable("pages")
  })
}

export const down = async (knex) => {
  await knex.schema.dropTable("rel_navigation_menus__pages")
  await knex.schema.dropTable("navigation_menus")
  await knex.schema.dropTable("rel_users__pages")
  await knex.schema.dropTable("pages")
  await knex.schema.dropTable("users")
  await knex.schema.dropTable("roles")
}
