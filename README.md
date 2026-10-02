# My Bookmarks

A small bookmark manager built with Java, Spring Boot, Thymeleaf, MySQL, HTML, CSS, and JavaScript. Add, edit, search, filter, favorite, and delete bookmarks. Bookmark data is stored in MySQL.

## Run locally

Requirements: Java 17 or newer, Maven, and MySQL.

Create the database in MySQL:

```sql
CREATE DATABASE bookmark_manager;
```

Set your MySQL credentials in PowerShell, then start the app from the project folder:

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your-password"
mvn spring-boot:run
```

Open `http://localhost:8080`. Spring Boot creates the bookmarks table on first run. The default database URL is `jdbc:mysql://localhost:3306/bookmark_manager`; override it with `DB_URL` if needed.

## API

- `GET /api/bookmarks`
- `POST /api/bookmarks`
- `PUT /api/bookmarks/{id}`
- `DELETE /api/bookmarks/{id}`

The page and API are served by the same app. There is no login or user system in this small demo.
