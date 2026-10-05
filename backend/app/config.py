from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", populate_by_name=True)

    database_url: str = "sqlite:///./fitness.db"
    jwt_secret: str = Field(min_length=16)
    # .env.example documents JWT_ACCESS_MINUTES; TOKEN_MINUTES is kept as an alias.
    token_minutes: int = Field(
        default=60 * 24 * 7,
        validation_alias=AliasChoices("JWT_ACCESS_MINUTES", "TOKEN_MINUTES"),
    )
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"


settings = Settings()
