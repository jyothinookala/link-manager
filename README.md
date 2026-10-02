# My Bookmarks

A small bookmark manager built with Java, Spring Boot, Thymeleaf, MySQL, HTML, CSS, and JavaScript. Add, edit, search, filter, favorite, and delete bookmarks. Bookmark data is stored in MySQL.

## Run locally

Requirements: Java 17 or newer, Maven, and MySQL 8.0 or newer.

This app has no user sign-in. `DB_USERNAME` and `DB_PASSWORD` are only for the MySQL connection; they are optional when using the defaults (`root` with a blank password).

Create the database in MySQL:

```sql
CREATE DATABASE bookmark_manager;
```

Start the app from the project folder:

```powershell
mvn spring-boot:run
```

Open `http://localhost:8080`. Spring Boot creates the bookmarks table on first run. The default database URL is `jdbc:mysql://localhost:3306/bookmark_manager`; override it with `DB_URL` if needed. If your MySQL setup uses different connection credentials, set `DB_USERNAME` and `DB_PASSWORD` before starting the app.

The page submits forms to Spring MVC. The controller uses the repository to read and update bookmark records in MySQL, and Thymeleaf renders the results.
