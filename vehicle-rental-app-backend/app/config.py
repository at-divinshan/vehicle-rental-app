from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    app_name: str = "Yaal Vazh Vehicle Rental API"
    secret_key: str = "change-this-in-production"
    access_token_expire_minutes: int = 60 * 24
    db_driver: Literal["mysql"] = "mysql"
    db_user: str = "vehicle_user"
    db_password: str = ""
    db_host: str = "localhost"
    db_port: int = 3306
    db_name: str = "vehicle_rental_db"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    admin_email: str = "admin@yaalvazh.lk"
    admin_password: str = "change-admin-password"

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[1] / ".env",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def database_url(self) -> URL:
        return URL.create(
            "mysql+pymysql", username=self.db_user, password=self.db_password,
            host=self.db_host, port=self.db_port, database=self.db_name,
            query={"charset": "utf8mb4"},
        )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
