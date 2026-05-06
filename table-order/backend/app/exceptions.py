from fastapi import HTTPException, status


class AppException(HTTPException):
    def __init__(self, status_code: int, detail: str, error_code: str = "UNKNOWN_ERROR"):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code


class NotFoundError(AppException):
    def __init__(self, detail: str = "리소스를 찾을 수 없습니다"):
        super().__init__(status.HTTP_404_NOT_FOUND, detail, "NOT_FOUND")


class UnauthorizedError(AppException):
    def __init__(self, detail: str = "인증이 필요합니다"):
        super().__init__(status.HTTP_401_UNAUTHORIZED, detail, "UNAUTHORIZED")


class ForbiddenError(AppException):
    def __init__(self, detail: str = "접근 권한이 없습니다"):
        super().__init__(status.HTTP_403_FORBIDDEN, detail, "FORBIDDEN")


class ValidationError(AppException):
    def __init__(self, detail: str = "입력값이 올바르지 않습니다"):
        super().__init__(status.HTTP_422_UNPROCESSABLE_ENTITY, detail, "VALIDATION_ERROR")


class ConflictError(AppException):
    def __init__(self, detail: str = "리소스 충돌이 발생했습니다"):
        super().__init__(status.HTTP_409_CONFLICT, detail, "CONFLICT")


class AccountLockedError(AppException):
    def __init__(self, detail: str = "계정이 잠겨있습니다"):
        super().__init__(status.HTTP_423_LOCKED, detail, "ACCOUNT_LOCKED")
