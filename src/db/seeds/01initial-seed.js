import hashPassword from "../hashPassword.js"

export const seed = async (knex) => {
  await knex.raw(
    "TRUNCATE TABLE rel_navigation_menus__pages RESTART IDENTITY CASCADE"
  )
  await knex.raw("TRUNCATE TABLE navigation_menus RESTART IDENTITY CASCADE")
  await knex.raw("TRUNCATE TABLE rel_users__pages RESTART IDENTITY CASCADE")
  await knex.raw("TRUNCATE TABLE pages RESTART IDENTITY CASCADE")
  await knex.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
  await knex.raw("TRUNCATE TABLE roles RESTART IDENTITY CASCADE")

  const [passwordHash, passwordSalt] = await hashPassword("Password123?")

  await knex("roles").insert([
    {
      name: "No role",
      permissions: {
        users: "",
        roles: "",
        pages: "",
        navigation_menus: "",
        rel_navigations_pages: "",
      },
    },
    {
      name: "admin",
      permissions: {
        users: "CRUD",
        roles: "CRUD",
        pages: "CRUD",
        navigation_menus: "CRUD",
        rel_navigations_pages: "CRUD",
      },
    },
    {
      name: "manager",
      permissions: {
        users: "",
        roles: "",
        pages: "CD",
        navigation_menus: "CRUD",
        rel_navigations_pages: "CRUD",
      },
    },
    {
      name: "editor",
      permissions: {
        users: "",
        roles: "",
        pages: "UR",
        navigation_menus: "R",
        rel_navigations_pages: "",
      },
    },
  ])

  await knex("users").insert([
    {
      email: "admin@example.com",
      roleId: 2,
      firstName: "John",
      lastName: "Doe",
      passwordHash: passwordHash,
      passwordSalt: passwordSalt,
    },
    {
      email: "manager@example.com",
      roleId: 3,
      firstName: "Jane",
      lastName: "Doe",
      passwordHash: passwordHash,
      passwordSalt: passwordSalt,
    },
    {
      email: "editor@example.com",
      roleId: 4,
      firstName: "Bob",
      lastName: "Smith",
      passwordHash: passwordHash,
      passwordSalt: passwordSalt,
    },
  ])

  await knex("pages").insert([
    {
      title: "Home page",
      content: "Here is my home page",
      urlSlug: "homepage",
      creator: 1,
      publishedAt: knex.fn.now(),
      status: "published",
    },
    {
      title: "About",
      content: "Here is my about page",
      urlSlug: "about",
      creator: 1,
      publishedAt: knex.fn.now(),
      status: "published",
    },
    {
      title: "Contact",
      content: "Here is my contact page",
      urlSlug: "contact",
      creator: 1,
      publishedAt: knex.fn.now(),
      status: "published",
    },
    {
      title: "Products",
      content: "Here is my products page",
      urlSlug: "products",
      creator: 1,
      publishedAt: knex.fn.now(),
      status: "published",
    },
    {
      title: "T-shirts",
      content: "Here is my t-shirts page",
      urlSlug: "t-shirts",
      creator: 1,
      publishedAt: knex.fn.now(),
      status: "published",
    },
    {
      title: "Shoes",
      content: "Here is my shors page",
      urlSlug: "shoes",
      creator: 1,
      publishedAt: knex.fn.now(),
      status: "published",
    },
    {
      title: "T-shirts male",
      content: "Here is my page for the male t-shirts",
      urlSlug: "male-t-shirts",
      creator: 1,
      publishedAt: knex.fn.now(),
      status: "published",
    },
    {
      title: "T-shirts women",
      content: "Here is my page for the women t-shirts",
      urlSlug: "women-t-shirts",
      creator: 1,
      publishedAt: knex.fn.now(),
      status: "draft",
    },
    {
      title: "Sneakers",
      content: "Here is my sneakers page",
      urlSlug: "sneakers",
      creator: 1,
      publishedAt: knex.fn.now(),
      status: "published",
    },
    {
      title: "Boot",
      content: "Here is my boot page",
      urlSlug: "boot",
      creator: 1,
      publishedAt: knex.fn.now(),
      status: "draft",
    },
  ])

  await knex("rel_users__pages").insert([
    { pageId: 1, updatedBy: 2, updatedAt: knex.fn.now() },
    { pageId: 2, updatedBy: 1, updatedAt: knex.fn.now() },
  ])

  await knex("navigation_menus").insert([
    { name: "Main menu" },
    { name: "Footer menu" },
  ])

  await knex("rel_navigation_menus__pages").insert([
    // Main Menu
    {
      menuId: 1,
      pageId: 1,
      parentId: null,
    },
    // Home page
    {
      menuId: 1,
      pageId: 2,
      parentId: null,
    },
    // Page about dans le menu principal
    {
      menuId: 1,
      pageId: 3,
      parentId: null,
    },
    // Page contact dans le menu principal
    {
      menuId: 1,
      pageId: 4,
      parentId: null,
    },

    // Products
    // Sous-menu de products 1
    {
      menuId: 1,
      pageId: 5,
      parentId: 4,
    },

    // T-shirts
    // Sous-menu de t-shirts
    {
      menuId: 1,
      pageId: 7,
      parentId: 5,
    },
    // T-shirts male
    {
      menuId: 1,
      pageId: 8,
      parentId: 5,
    },
    // T-shirts women

    // Sous-menu de products 2
    {
      menuId: 1,
      pageId: 6,
      parentId: 4,
    },

    // Shoes
    // Sous-menu de shoes
    {
      menuId: 1,
      pageId: 9,
      parentId: 6,
    },
    // Sneakers
    {
      menuId: 1,
      pageId: 10,
      parentId: 6,
    },
    // Boot

    // Footer menu
    {
      menuId: 2,
      pageId: 1,
      parentId: null,
    },
    // Page d'accueil dans le footer menu
    {
      menuId: 2,
      pageId: 2,
      parentId: null,
    },
    // Page about dans le footer menu
    {
      menuId: 2,
      pageId: 3,
      parentId: null,
    },
    // Page contact dans le footer menu
  ])
}
