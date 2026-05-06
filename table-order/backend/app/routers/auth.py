from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_admin
from app.schemas.auth import AdminInfo, AdminLoginRequest, TokenResponse
from app.schemas.common import SuccessResponse
from app.services import auth_service

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def admin_login(request: AdminLoginRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.authenticate_admin(db, request)


@router.post("/logout", response_model=SuccessResponse)
async def admin_logout(admin: AdminInfo = Depends(get_current_admin)):
    return SuccessResponse(message="로그아웃 되었습니다")


@router.get("/me", response_model=AdminInfo)
async def get_admin_info(admin: AdminInfo = Depends(get_current_admin)):
    return admin
