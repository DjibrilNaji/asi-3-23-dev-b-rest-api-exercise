import hashPassword from "../hashPassword.js"

export const seed = async (knex) => {
  await knex("users").del()
  await knex("roles").del()

  const [passwordHash, passwordSalt] = await hashPassword("Password123?")

  await knex("roles").insert([
    {
      id: 1,
      name: "admin",
      permissions: {
        users: "CRUD",
        roles: "CRUD",
        status: "CRUD",
        pages: "CRUD",
        navigation_menu: "CRUD",
      },
    },
    {
      id: 2,
      name: "manager",
      permissions: {
        users: "",
        roles: "",
        status: "",
        pages: "CD",
        navigation_menu: "CRUD",
      },
    },
    {
      id: 3,
      name: "editor",
      permissions: {
        users: "",
        roles: "",
        status: "",
        pages: "R",
        navigation_menu: "R",
      },
    },
  ])

  await knex("users").insert([
    {
      email: "admin@example.com",
      roleId: 1,
      firstName: "John",
      lastName: "Doe",
      passwordHash: passwordHash,
      passwordSalt: passwordSalt,
    },
    {
      email: "manager@example.com",
      roleId: 2,
      firstName: "Jane",
      lastName: "Doe",
      passwordHash: passwordHash,
      passwordSalt: passwordSalt,
    },
    {
      email: "editor@example.com",
      roleId: 3,
      firstName: "Bob",
      lastName: "Smith",
      passwordHash: passwordHash,
      passwordSalt: passwordSalt,
    },
  ])
}
