"""Copy existing SQLite records into an empty MySQL database without changing the source."""
import sys
from pathlib import Path
from sqlalchemy import create_engine, select, func
from sqlalchemy.engine import URL

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from app.database import Base, engine
from app import models  # register every table


def main():
    path = ROOT / 'database' / 'vehicle_rental.sqlite3'
    if not path.is_file():
        raise SystemExit(f'Source database does not exist: {path}')
    source = create_engine(URL.create('sqlite', database=str(path)))
    Base.metadata.create_all(engine)
    with source.connect() as original, engine.begin() as destination:
        tables = Base.metadata.sorted_tables
        if any(destination.scalar(select(func.count()).select_from(table)) for table in tables):
            raise SystemExit('Destination is not empty. Migration refused; no records changed.')
        for table in tables:
            records = [dict(row) for row in original.execute(select(table)).mappings()]
            if records:
                destination.execute(table.insert(), records)
            count = destination.scalar(select(func.count()).select_from(table))
            if count != len(records):
                raise RuntimeError(f'Count mismatch for {table.name}; rolling back')
            print(f'{table.name}: {count} rows copied')
    source.dispose()
    engine.dispose()
    print('Migration complete. Original SQLite file preserved.')


if __name__ == '__main__':
    main()
