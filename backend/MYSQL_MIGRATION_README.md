# Seemanchal Express Backend — Hostinger MySQL Edition

This is the MySQL-converted backend for the supplied Seemanchal Express project. It follows the same compatibility-layer approach as the earlier Shiv NGO MySQL backend.

## What was changed

- Replaced the MongoDB connection with a `mysql2/promise` connection pool.
- Removed the `mongoose` and MongoDB runtime dependencies.
- Added `src/config/mysql-odm.js`, a compatibility layer for the Mongoose-style model methods already used by this backend.
- Converted model persistence into MySQL tables. Scalar fields use typed SQL columns (`TEXT`, `DOUBLE`, `TINYINT(1)`, `DATETIME(3)`, and `BIGINT UNSIGNED`); nested objects and arrays use MySQL `JSON` columns.
- Added MySQL table/index creation at application startup.
- Preserved existing route paths, model names, JWT authentication, password hashing, and API response object shapes.
- Added array-reference population support for News categories, settings statics, timestamp options, and the date grouping used by the admin dashboard.
- Added `.env.example`, `npm run db:check`, and this Hostinger setup guide.

## Requirements

- Node.js 18.18 or newer (Node 20 LTS recommended).
- MySQL 8+ recommended.
- Hostinger Node.js hosting with permission to connect to the MySQL database created in hPanel.

## Local setup

1. Create a MySQL database and database user.
2. Copy `.env.example` to `.env`.
3. Fill in `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, and `MYSQL_PASSWORD`.
4. Set `FRONTEND_URL` to the exact deployed frontend origin.
5. Replace `JWT_SECRET` and `JWT_REFRESH_SECRET` with long, random secrets.
6. Run `npm install`.
7. Run `npm run db:check` to verify the MySQL connection and create the application tables.
8. Run `npm start`.

## Hostinger deployment

1. In hPanel, open **Databases → Management**, create a MySQL database and user, and assign the user to the database with all required privileges.
2. Upload the contents of this backend ZIP to the Node.js application's application root. Keep the `src` and `uploads` folders in their original locations.
3. Set the startup file to `src/server.js`.
4. Add the environment variables from `.env.example` in the Node.js application's environment-variable settings. Use the exact database host, database name, username, and password shown by Hostinger; do not assume `localhost` if hPanel provides a different host.
5. Set `FRONTEND_URL` to the deployed Next.js website origin (without `/api`).
6. Install dependencies (`npm install`) and restart the Node.js application.
7. Check `https://YOUR_API_DOMAIN/api/health`.
8. Check the admin login, news listing/details, category pages, reporter/member flows, complaints, legal acceptance, settings, and image uploads from the frontend.

## Database behaviour and compatibility notes

- Tables are created automatically when the backend starts and the MySQL connection succeeds.
- Table names include `users`, `news`, `categories`, `positions`, `complaints`, `inquiries`, `legal_documents`, `legal_document_acceptances`, `legal_document_versions`, `admin_activity_logs`, and `site_settings`.
- Primary keys are MySQL auto-increment `BIGINT` values returned to the API as strings, preserving the string ID shape expected by the existing frontend.
- Relationships are stored as scalar ID columns and JSON arrays where appropriate. This compatibility migration does not add relational foreign-key constraints.
- Existing MongoDB records are not copied. The new MySQL database starts empty unless you seed/import data separately.
- Uploaded files in `uploads/` are included in this ZIP. Configure persistent storage and regular backups for uploads on the hosting account.
- The compatibility layer currently evaluates some filters, sorting, pagination, and aggregations in application memory after loading rows. It preserves the current app's existing query behaviour but is not intended as a high-volume analytics database. For large production datasets, the next step should be dedicated SQL queries and normalized relationship tables.
- If a table already exists, `CREATE TABLE IF NOT EXISTS` will not automatically alter its existing columns or indexes. For a fresh deployment, use a new empty MySQL database. Back up any existing MySQL data before manual schema changes.

## Security

- Never commit the real `.env` file.
- Use strong, unique JWT secrets.
- Restrict database access to the application account.
- Use HTTPS for the frontend and API.
- Keep Hostinger's Node.js and MySQL credentials private.
