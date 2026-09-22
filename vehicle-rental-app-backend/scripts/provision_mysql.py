"""Emit database provisioning SQL for piping directly into an administrator mysql client."""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.config import settings

# Strict identifiers and hex password avoid quoting/SQL-mode ambiguity.
if not re.fullmatch(r'[a-zA-Z0-9_]+', settings.db_name):
    raise SystemExit('DB_NAME must contain only letters, digits and underscores for this helper.')
if not re.fullmatch(r'[a-zA-Z0-9_]+', settings.db_user):
    raise SystemExit('DB_USER must contain only letters, digits and underscores for this helper.')
if settings.db_host not in ('localhost', '127.0.0.1'):
    raise SystemExit('This helper provisions a local MySQL server only.')
if not settings.db_password:
    raise SystemExit('Set a nonempty DB_PASSWORD in .env first.')
name, user = settings.db_name, settings.db_user
password = settings.db_password.encode().hex()
print("SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';")
print(f'CREATE DATABASE IF NOT EXISTS `{name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;')
print(f"SET @password = CONVERT(X'{password}' USING utf8mb4);")
for statement in ('CREATE USER IF NOT EXISTS', 'ALTER USER'):
    print(f'''SET @sql = CONCAT('{statement} \\'{user}\\'@\\'localhost\\' IDENTIFIED BY ', QUOTE(@password));''')
    print('PREPARE provision FROM @sql; EXECUTE provision; DEALLOCATE PREPARE provision;')
print(f"GRANT ALL PRIVILEGES ON `{name}`.* TO '{user}'@'localhost';")
