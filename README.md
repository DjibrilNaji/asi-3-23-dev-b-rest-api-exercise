### Link to the repo :

https://github.com/DjibrilNaji/asi-3-23-dev-b-rest-api-exercise

# To use this directory

> Follow these commands on your terminal

```bash
git clone https://github.com/DjibrilNaji/asi-3-23-dev-b-rest-api-exercise.git
```

```bash
cd asi-3-23-dev-b-rest-api-exercise
```

```bash
npm install
```

> Create your .env with these fields

```
PORT=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_DATABASE=
SECURITY_JWT_SECRET=
SECURITY_PASSWORD_PEPPER=
```

> When done, run these commands:

```bash
npx knex migrate:latest
```

```
npx knex seed:run
```

```
npm run dev
```

> Your server will be running on : http://localhost: **_Your PORT_**

# **Here is the documentation of the different routes :**

To be able to use the routes that need a session, you will have to use the `/sign-in` routes, retrieve the token, and put it in `Authorization`. (_Bearer token on postman_)

# Roles

- ## View all roles (**GET** "/roles")

> **_Permissions : Admin_**
> This route returns the list of existing roles with pagination :

- the limit `/roles?limit=2`

- the page number `/roles?page=2`

and a sort in ascending or descending order (asc, desc):

- the order `/roles?order=desc`

The results are returned as a JSON object which is an array of existing roles.

---

- ## View specific role by Id (**GET** "/roles/:roleId")

> **_Permissions : Admin_**

This route returns a single item of existing roles based on id. If the role does not exist, an error message will be returned.

---

- ## Update role by Id (**PATCH** "/roles/:roleId")

> **_Permissions : Admin_**

This route allows you to update a role by entering the role id.

### Here is a `body` type

```json
{
  "name": "UpdatedRole",
  "permissions": {
    "users": "C",
    "roles": "CR",
    "pages": "R",
    "navigation_menu": "R"
  }
}
```

---

# Users

- ## Add users (**POST** "/users")

> **_Permissions : Admin_**

This route allows you to create a new user. If the user already exists by his email, an error message will be returned.

### Here is a `body` type

```json
{
  "email": "admin@example.com",
  "roleId": 1,
  "firstName": "admin", // facultatif
  "lastName": "admin", // facultatif
  "password": "Password123?"
}
```

- ## Sign-in (**POST** "/sign-in")

> **_Permissions : Aucune_**

This route allows users to connect. When the user uses this route, a token is returned, which will be used to check if he is logged in and if his role has permissions to access certain routes.

### Here is a `body` type

```json
{
  "email": "admin@example.com",
  "password": "Password123?"
}
```

- ## View all users (**GET** "/users")

> **_Permissions : Admin_**

This route returns the list of existing users with pagination:

- the limit `/users?limit=2`

- the page number `/users?page=2`

A sort in ascending or descending order (asc, desc):

- the order `/users?order=desc`

The results are returned as a JSON object which is an array of existing users.

- ## View specific users by Id (**GET** "users/:userId")

> **_Permissions : Admin or Self_**

This route returns a single element of existing users based on id. If the user does not exist, an error message will be returned.

- ## Update user by Id (**PATCH** "/users/:userId")

> **_Permissions : Admin or Self_**

This route allows to update a user by his id.

The role of the user can only be modified by an admin.

### Here is a `body` type

```json
{
  "email": "adminchange@gmail.com",
  "roleId": 1, // only admin
  "firstName": "admin",
  "lastName": "admin",
  "password": "PasswordChange123?"
}
```

- ## Delete users by Id (**DELETE** "users/:userId")

> **_Permissions : Admin or Self_**

This route allows to delete a user by his id. All users who have this menu as a parent will also be deleted.

All pages, all relationships between users and pages, and all relationships between pages and navigation menus will be deleted along with the user.

# Navigations Menu

- ## Add navigation-menu (**POST** "/navigation-menus")

> **_Permissions : Admin or manager_**

This route creates a new navigation menu. If the navigation menu already exists, an error message will be returned.

### Here is a `body` type

```json
{
  "name": "New menu"
}
```

- ## View all navigation-menus (**GET** "/navigation-menus")

> **_Permissions : All_**

This route returns the list of existing navigation menus with pagination:

- the limit `/navigation-menus?limit=2`

- the page number `/navigation-menus?page=2`

A sort in ascending or descending order (asc, desc):

- the order `/navigation-menus?order=desc`

The results are returned as a JSON object which is an array of existing navigation menus.

- ## View specific navigation-menu by Id (**GET** "navigation-menus/:navigationMenuId")

> **_Permissions : All_**

This route returns a single item from existing navigation menus based on id. If the navigation menu does not exist, an error message will be returned.

- ## Update navigation-menus by Id (**PATCH** "navigation-menus/:navigationMenuId")

> **_Permissions : Admin or manager_**

This route is used to update a navigation menu by its id.

### Here is a `body` type

```json
{
  "name": "Menu modified"
}
```

- ## Delete navigation-menus by Id (**DELETE** "navigation-menus/:navigationMenuId")

**_Delete a menu, return to delete all the pages that have it as a parent_**

> **_Permissions : Admin or manager_**

This route allows you to delete a navigation menu by its id. All pages that have this menu as a parent will also be deleted.

# Pages

- ## Add pages (**POST** "/pages")

> **_Permissions : Admin or manager_**

This route creates a new page. If the already exists by its slug, an error message will be returned.

### Here is a `body` type

```json
{
  "title": "New title",
  "content": "Ma nouvelle page",
  "urlSlug": "new-page",
  "status": "draft",
  "menuId": 1,
  "parentId": 3 //facultatif
}
```

- ## View all pages (**GET** "/pages")

> **_Permissions : all (published), logged users (draft)_**

This route returns the list of existing pages with pagination:

- the limit `/pages?limit=2`

- the page number `/pages?page=2`

A sort in ascending or descending order (asc, desc):

- the order `/pages?order=desc`

The results are returned as a JSON object which is an array of existing pages.

Returned pages are filtered based on session status. If a session is active, all pages are returned. Otherwise, only published pages are returned.

- ## View specific page by Id (**GET** "/pages/:pageId")

> **_Permissions : all (published), logged users (draft)_**

This route returns a single item from existing pages based on id. If the page does not exist, an error message will be returned.

The returned page is filtered based on session status. If a session is active, the page is returned. Otherwise an error is returned.

- ## Update page by Id (**PATCH** "/pages/:pageId")

> **_Permissions : Logged users_**

This route allows to update a page by its id.

The url slug will only be editable by an admin.

### Here is a `body` type

```json
{
  "title": "Page modified",
  "content": "Ma page après modification",
  "urlSlug": "page-modified",
  "status": "published"
}
```

- ## Delete page by Id (**DELETE** "/pages/:pageId")

> **_Permissions : Admin or manager_**

This route allows you to delete a page by its id.

All relationships between users and pages and all relationships between pages and navigation menus will be deleted along with the page.

# Relation between navigation-menus and pages

- ## Add relation (**POST** "/rel-navigations-pages")

> **_Permissions : Admin or manager_**

This route creates a new relationship between menus and pages.

### Here is a `body` type

```json
{
  "menuId": 1,
  "pageId": 1,
  "parentId": 6
}
```

- ## View all relation menus-pages (**GET** "/rel-navigations-pages")

> **_Permissions : Admin or manager_**

This route returns the list of existing relationships with a pagination:

- the limit `/rel-navigations-pages?limit=2`

- the page number `/rel-navigations-pages?page=2`

A sort in ascending or descending order (asc, desc):

- the order `/rel-navigations-pages?order=desc`

The results are returned as a JSON object which is an array of existing relationships.

- ## View specific relation by /page/id or /menu/id (**GET** "/rel-navigations-pages/:ressource/:id")

> **_Permissions : Admin or manager_**

This route returns the list of existing relations of a specific page filled in by the id, and which may have a pagination:

- the limit `/rel-navigations-pages/:ressource/:id?limit=2`

- the page number `/rel-navigations-pages/:ressource/:id?page=2`

A sort in ascending or descending order (asc, desc):

- the order `/rel-navigations-pages/ressource/:id?order=desc`

The results are returned as a JSON object which is an array of existing relationships.

- ## Update relation by Id (**PATCH** "/rel-navigations-pages/:id")

> **_Permissions : Admin or manager_**

This route allows to update a relation by its id.

### Here is a `body` type

```json
{
  "menuId": 1,
  "pageId": 1,
  "parentId": 5
}
```

- ## Delete relation by Id (**DELETE** "/rel-navigations-pages/:id")

> **_Permissions : Admin or manager_**

This route allows you to delete a relation by its id.
