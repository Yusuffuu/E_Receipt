# Deployment Preparation Guide

This file summarizes the setup steps for pushing to GitHub, deploying the backend to Render, deploying the frontend to Vercel, and preparing a persistent database.

## 1. GitHub readiness

- `.gitignore` has been updated to ignore:
  - `node_modules/`
  - `backend/node_modules/`
  - `frontend/node_modules/`
  - `*.env`
  - `backend/.env`
  - `frontend/.env`
  - `backend/uploads/`
  - build and dist output
  - logs and editor files

- The obsolete root `package-lock.json` and root `package.json` have been removed from version control.
- New example env files were added:
  - `backend/.env.example`
  - `frontend/.env.example`

## 2. Backend deployment to Render

### Recommended service settings

- Root directory for service: `/backend`
- Build command: none needed if using `start` directly
- Start command: `npm start`
- Environment: Node.js

### Required environment variables

```
PORT=5000
FRONTEND_URL=https://your-vercel-app.vercel.app
JWT_SECRET=your_jwt_secret
LANDLORD_USERNAME=admin
LANDLORD_PASSWORD=strongpassword
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=511_homes
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your-email-password
```

> Note: The current backend uses MariaDB, not PostgreSQL. If you want to use Neon, the backend must be migrated to Postgres/Neon.

### Important production warning

- Uploaded files are stored in `backend/uploads/`.
- Render's filesystem is ephemeral and will lose files on deploy/restart.
- Use a persistent storage solution instead (S3, DigitalOcean Spaces, Render Persistent Disk, etc.) or remove direct local upload storage.

## 3. Frontend deployment to Vercel

### Recommended settings

- Deploy from the `frontend` folder.
- Build command: `npm run build`
- Output directory: `dist`

### Required environment variables

```
VITE_API_URL=https://your-backend.onrender.com/api
```

### Notes

- The `homepage` field was removed from `frontend/package.json` because it is unnecessary for Vercel deployment.
- Do not commit `frontend/.env`.

## 4. Persistent database with Neon

### Current status

- The project currently uses `mariadb` and MySQL-style SQL in `database/schema.sql`.
- Neon is PostgreSQL, so the backend is not ready for Neon yet.

### What needs to change for Neon

- Replace `mariadb` with a PostgreSQL client such as `pg`, `neon`, or Prisma.
- Update `backend/config/db.js` to connect using a Neon connection string.
- Convert `database/schema.sql` to PostgreSQL syntax:
  - replace `AUTO_INCREMENT` with `SERIAL` or `GENERATED ALWAYS AS IDENTITY`
  - replace backticks with standard SQL identifiers
  - replace `ENUM` types with `TEXT` + `CHECK` or native PostgreSQL `ENUM`
  - replace `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` logic

### If you do not migrate

- Use a MySQL/MariaDB cloud database instead of Neon.
- The current backend will work with a compatible MariaDB host and the existing `DB_*` env vars.

## 5. Recommended Git workflow

1. Review unstaged changes using `git status`.
2. Stage the prepared files and any source files you want included:
   - `git add .gitignore backend/.env.example frontend/.env.example frontend/package.json`
3. Commit with a clear message:
   - `git commit -m "Prepare repository for deployment: cleanup, ignore rules, env examples"`
4. Add the full project and push to GitHub:
   - `git add backend frontend database README.md DEPLOYMENT.md` (and any other source files)
   - `git commit -m "Add backend, frontend, and database sources for deployment"`
   - `git push origin main`

## 6. Next steps

- Create actual `.env` files locally from the examples.
- Choose a cloud database provider:
  - If staying with MariaDB/MySQL: use a MariaDB host.
  - If using Neon: migrate backend SQL and driver.
- Configure Render and Vercel environment variables after deployment.
