#!/usr/bin/env bash
set -euo pipefail
app_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$app_root/vehicle-rental-app-backend"
# The MySQL client reads the root password from the terminal, while stdin
# receives the provisioning SQL. Never put the password in command arguments.
printf 'Enter your MySQL root password when prompted (not your sudo password).\n'
.venv/bin/python scripts/provision_mysql.py | mysql -u root -p
.venv/bin/python - <<'PY'
from sqlalchemy import text
from app.database import engine
with engine.connect() as db:
    print('MySQL connection verified:', db.scalar(text('SELECT VERSION()')))
PY
printf 'MySQL configured. Before starting the app, run the migration if you need your SQLite data (see README).\n'
