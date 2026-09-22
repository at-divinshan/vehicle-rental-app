# Vehicle Rental App

FastAPI backend for the React/Vite vehicle rental frontend, using MySQL 8.

## MySQL setup and run

The backend uses MySQL through PyMySQL, with `utf8mb4` connections. Connection settings are in `.env`; this checkout targets `127.0.0.1:3306`. SQLite is retained only for isolated tests and as the source of the optional migration.

On a fresh checkout, install MySQL 8, Python 3 and Node.js, then:

```bash
cd vehicle-rental-app-backend
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
cp .env.example .env
```

Set `DB_PASSWORD`, `SECRET_KEY` and `ADMIN_PASSWORD` in `.env`. Do not overwrite an existing configured `.env`.

For a local MySQL server with root password authentication, run from the repository root:

```bash
./setup-mysql.sh
```

This uses `mysql -u root -p` and prompts for your **MySQL root password**, not your system/sudo password. The MySQL client reads the password directly from your terminal; the script does not store it. It creates the configured database and user, sets that user's password to match `.env`, grants access to the app database, and verifies the app's connection. It requires a running MySQL service. It does not migrate or delete records.

Alternatively, run the provisioning command directly from the backend directory:

```bash
set -o pipefail
.venv/bin/python scripts/provision_mysql.py | mysql -u root -p
```

The provisioning helper targets a local server and updates the configured app user's password. For a remote server, ask its administrator to provision the database/user and set matching connection details in `.env`.

Before starting the API for the first time, migrate existing SQLite data if needed:

```bash
cd vehicle-rental-app-backend
.venv/bin/python scripts/migrate_sqlite.py
```

Stop any old API process first to prevent writes during migration. The migration preserves IDs, password hashes, bookings and payments, copies in foreign-key order and verifies row counts. It refuses a nonempty destination. Inserts run in one transaction and roll back on failure. The original `database/vehicle_rental.sqlite3` remains unchanged as a backup. MySQL table creation may remain after a failed migration; records are rolled back.

Install frontend dependencies and launch from the repository root:

```bash
(cd vehicle-rental-details-fix && npm install)
./start-local.sh
```

Open `http://localhost:5173/login`. Startup creates missing tables, seeds the fleet if empty, and creates the configured admin account if absent. Admin credentials come from `ADMIN_EMAIL` and `ADMIN_PASSWORD`; migrating accounts preserves their existing passwords. API docs: `http://localhost:8000/docs`.

## API

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /vehicles`, `GET /vehicles/{id}`
- `GET /bookings`, `POST /bookings`, `PATCH /bookings/{booking_id}/cancel`
- `POST /payments`, `GET /payments/{booking_id}`
- `GET /docs` for the interactive OpenAPI documentation

## Verify the login and booking API

```bash
.venv/bin/pip install -r requirements-dev.txt
.venv/bin/python -m unittest discover -s tests -v
```

By default these tests use an isolated in-memory SQLite database. To test MySQL, set `TEST_DATABASE_URL` to a dedicated, empty test database URL (`mysql+pymysql://...`) and run the same command. Never use the app database: the tests create and drop tables. They cover registration, login, session validation, booking creation and totals, account isolation, and cancellation.

`bcrypt==4.0.1` is pinned because Passlib 1.7.4's backend initialization fails with bcrypt 5.0.0, including for short passwords.

If startup reports MySQL error 1045 (access denied), correct `DB_USER` and `DB_PASSWORD` in `.env`. The `CREATE USER IF NOT EXISTS` statement in `database/init.sql` does not update an existing user's password.

## Admin management

Admin accounts can open `/dashboard` in the frontend and choose Vehicles, Customers, or Bookings. The panel supports search, edit forms, validation errors, and saved-state feedback.

- `PUT /vehicles/{id}` updates vehicle specifications, daily price, image, location, and availability.
- `GET /customers` lists customer accounts; `PUT /customers/{id}` updates name, email, and phone. Email changes affect future sign-in. Roles, passwords, and admin profiles are not editable through this endpoint.
- `PATCH /bookings/{booking_id}/status` sets Confirmed, Completed, or Cancelled.

All these management endpoints require an admin token. Existing booking prices and customer contact snapshots are preserved when vehicle prices or customer profiles change.
