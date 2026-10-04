from pydantic import BaseModel


class CoachRequest(BaseModel):
    message: str


class CoachResponse(BaseModel):
    response: str