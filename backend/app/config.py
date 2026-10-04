from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str = "sqlite:///./fitness.db"
    jwt_secret: str
    anthropic_api_key: str = ""
    ai_model: str = "claude-sonnet-4-6"
    cors_origins: str = "http://localhost:5173"
    token_minutes: int = 60 * 24 * 7


settings = Settings()
