### Lien vers le repo :

https://github.com/DjibrilNaji/asi-3-23-dev-b-rest-api-exercise

# Pour utiliser ce repertoire

> Suivre ces commandes sur votre terminal

```bash
git clone https://github.com/DjibrilNaji/asi-3-23-dev-b-rest-api-exercise.git
```

```bash
cd asi-3-23-dev-b-rest-api-exercise
```

```bash
npm install
```

> Créér votre .env avec vos accès à votre BDD postgresSQL et la suite

```
PORT=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_DATABASE=
SECURITY_JWT_SECRET=
SECURITY_PASSWORD_PEPPER=
```

> Lorque cela est fait, executer ces commandes :

```bash
npx knex migrate:latest
```

```
npx knex seed:run
```

```
npm run dev
```

> Votre serveur sera lancer sur : http://localhost:**_Votre PORT_**

# **Voici la documentation des différentes routes :**

Pour pouvoir utiliser les routes qui ont besoin d'une session, il faudra utiliser la routes `/sign-in`, récupérer le token, et le mettre dans `l'authorization`. (_Bearer token sur postman_)

# Roles

- ## Add roles (**POST** "/roles")

> **_Permissions : Admin_**

Cette route permet de créer un nouveau role. Si le rôle existe déjà, un message d'erreur sera renvoyé.

L'objet permissions contient les ressources concernées par le CRUD.
Chaque ressource a ses propres permissions.

Les seules caractères accéptés sont C pour Create, R pour Read, U pour update, et D pour Delete. (CRUD)

### Voici un `body` type

```json
{
  "name": "NewRole",
  "permissions": {
    "users": "C",
    "roles": "",
    "pages": "R",
    "navigation_menu": "R"
  }
}
```

---

- ## View all roles (**GET** "/roles")

> **_Permissions : Admin_**

Cette route renvoie la liste des rôles existants avec une pagination :

- la limite `/roles?limit=2`

- le numéro de la page `/roles?page=2`

et un tri par ordre ascendant ou descendant (asc, desc) :

- l'order `/roles?order=desc`

Les résultats sont renvoyés sous la forme d'un objet JSON qui est un tableau des rôles existants.

---

- ## View specific role by Id (**GET** "/roles/:roleId")

> **_Permissions : Admin_**

Cette route renvoie un seul élément des rôles existants en fonction de l'id. Si le rôle n'existe pas, un message d'erreur sera renvoyé.

---

- ## Update role by Id (**PATCH** "/roles/:roleId")

> **_Permissions : Admin_**

Cette route permet de mettre à jour un rôle en renseignant l'id du rôle.

Voici un `body` type

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

- ## Delete rôle by Id (**DELETE** "roles/:roleId")

> **_Permissions : Admin_**

Cette route permet de supprimer un rôle par son id. Tous les users qui ont ce rôle auront comme rôle :

```json
{
  "name": "No role",
  "permissions": {
    "users": "",
    "roles": "",
    "pages": "",
    "navigation_menus": "",
    "rel_navigations_pages": ""
  }
}
```

Ce rôle doit avoir l'id 1 pour ne pas pouvoir être supprimé et pourvoir être utilisé sur les users dont le rôles sera supprimé.

---

# Users

- ## Add users (**POST** "/users")

> **_Permissions : Admin_**

Cette route permet de créer un nouveau user. Si l'user existe déjà par son email, un message d'erreur sera renvoyé.

### Voici un `body` type

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

Cette route permet aux users de se connecter. Lorsque l'user utilise cette route, un token est renvoyé, et sera utilisé pour verifier s'il est connecter et si son rôle à les permissions d'accéder a certaines routes.

Voici un `body` type

```json
{
  "email": "admin@example.com",
  "password": "Password123?"
}
```

- ## View all users (**GET** "/users")

> **_Permissions : Admin_**

Cette route renvoie la liste des users existants avec une pagination :

- la limite `/users?limit=2`

- le numéro de la page `/users?page=2`

Un tri par ordre ascendant ou descendant (asc, desc) :

- l'order `/users?order=desc`

Les résultats sont renvoyés sous la forme d'un objet JSON qui est un tableau des users existants.

- ## View specific users by Id (**GET** "users/:userId")

> **_Permissions : Admin or Self_**

Cette route renvoie un seul élément des users existants en fonction de l'id. Si l'user n'existe pas, un message d'erreur sera renvoyé.

- ## Update user by Id (**PATCH** "/users/:userId")

> **_Permissions : Admin or Self_**

Cette route permet de mettre à jour un user par son id.

Le rôle du user ne sera modifiable que par un admin.

### Voici un `body` type

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

> Permissions : Admin or Self

Cette route permet de supprimer un user par son id. Tous les users qui ont ce menu comme parent seront également supprimées.

Toutes les pages, toutes les relations entre les users et les pages et toutes les relations entre les pages et les menus de navigation seront supprimés en mêmes temps que l'user.

# Navigations Menu

- ## Add navigation-menu (**POST** "/navigation-menus")

> **_Permissions : Admin or manager_**

Cette route permet de créer un nouveau menu de navigation. Si le menu de navigation existe déjà, un message d'erreur sera renvoyé.

### Voici un `body` type

```json
{
  "name": "New menu"
}
```

- ## View all navigation-menus (**GET** "/navigation-menus")

> **_Permissions : All_**

Cette route renvoie la liste des menus de navigation existants avec une pagination :

- la limite `/navigation-menus?limit=2`

- le numéro de la page `/navigation-menus?page=2`

Un tri par ordre ascendant ou descendant (asc, desc) :

- l'order `/navigation-menus?order=desc`

Les résultats sont renvoyés sous la forme d'un objet JSON qui est un tableau des menus de navigation existants.

- ## View specific navigation-menu by Id (**GET** "navigation-menus/:navigationMenuId")

> **_Permissions : All_**

Cette route renvoie un seul élément des menus de navigation existants en fonction de l'id. Si le menu de navigation n'existe pas, un message d'erreur sera renvoyé.

- ## Update navigation-menus by Id (**PATCH** "navigation-menus/:navigationMenuId")

> **_Permissions : Admin or manager_**

Cette route permet de mettre à jour un menu de navigation par son Id.

### Voici un `body` type

```json
{
  "name": "Menu modified"
}
```

- ## Delete navigation-menus by Id (**DELETE** "navigation-menus/:navigationMenuId")

**_Delete a menu, return to delete all the pages that have it as a parent_**

> **_Permissions : Admin or manager_**

Cette route permet de supprimer un menu de navigation par son id. Toutes les pages qui ont ce menu comme parent seront également supprimées.

# Pages

- ## Add pages (**POST** "/pages")

> **_Permissions : Admin or manager_**

Cette route permet de créer une nouvelle page. Si la existe déjà par son slug, un message d'erreur sera renvoyé.

### Voici un `body` type

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

Cette route renvoie la liste des pages existantes avec une pagination :

- la limite `/pages?limit=2`

- le numéro de la page `/pages?page=2`

Un tri par ordre ascendant ou descendant (asc, desc) :

- l'order `/pages?order=desc`

Les résultats sont renvoyés sous la forme d'un objet JSON qui est un tableau des pages existantes.

Les pages renvoyées sont filtrées en fonction du statut de la session. Si une session est active, toutes les pages sont renvoyées. Sinon, seules les pages publiées sont renvoyées.

- ## View specific page by Id (**GET** "/pages/:pageId")

> **_Permissions : all (published), logged users (draft)_**

Cette route renvoie un seul élément des pages existantes en fonction de l'id. Si la page n'existe pas, un message d'erreur sera renvoyé.

La pages renvoyée est filtrée en fonction du statut de la session. Si une session est active, la page est renvoyée. Sinon une erreur est retournée.

- ## Update page by Id (**PATCH** "/pages/:pageId")

> **_Permissions : Logged users_**

Cette route permet de mettre à jour une page par son id.

Le slug de l'url ne sera modifiable que par un admin.

### Voici un `body` type

```json
{
  "title": "Page modified",
  "content": "Ma page après modification",
  "urlSlug": "page-modified",
  "status": "published"
}
```

- ## Delete page by Id (**DELETE** "/pages/:pageId")

Cette route permet de supprimer une page par son id.

Toutes les relations entre les users et les pages et toutes les relations entre les pages et les menus de navigation seront supprimés en mêmes temps que la page.
