### Lien vers le repo :

https://github.com/DjibrilNaji/asi-3-23-dev-b-rest-api-exercise

# Pour utiliser ce repertoire

> Suivre ces commandes sur votre terminal

```bash
1. git clone https://github.com/DjibrilNaji/asi-3-23-dev-b-rest-api-exercise.git

2. cd asi-3-23-dev-b-rest-api-exercise

3. npm install
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
1. npx knex migrate:latest
2. npx knex seed:run
3. npm run dev
```

> Votre serveur sera lancer sur : http://localhost:**_Votre PORT_**

# **Voici la documentation des différentes routes :**

# Roles

- ## Add roles (**POST** "/roles")

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

Cette route renvoie la liste des rôles existants avec une pagination :

- la limite `/roles?limit=2`

- le numéro de la page `/roles?page=2`

et un tri par ordre ascendant ou descendant (asc, desc) :

- l'order `/roles?order=desc`

Les résultats sont renvoyés sous la forme d'un objet JSON qui est un tableau des rôles existants.

---

- ## View specific role by Id (**GET** "/roles/:roleId")

Cette route renvoie un seul élément des rôles existants en fonction de l'id. Si le rôle n'existe pas, un message d'erreur sera renvoyé.

---

- ## Update role by Id (**PATCH** "/roles/:roleId")

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

Ce rôle ne peut être supprimé.

---

# Users
