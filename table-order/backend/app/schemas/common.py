from pydantic import BaseModel


class SuccessResponse(BaseModel):
    message: str = "성공"


class ErrorResponse(BaseModel):
    detail: str
    error_code: str = "UNKNOWN_ERROR"
