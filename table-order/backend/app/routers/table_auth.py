from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_table
from app.schemas.auth import TableLoginRequest, TableSessionInfo, TableTokenResponse
from app.services import table_auth_service

router = APIRouter()


@router.post("/login", response_model=TableTokenResponse)
async def table_login(request: TableLoginRequest, db: AsyncSession = Depends(get_db)):
    return await table_auth_service.authenticate_table(db, request)


@router.get("/session", response_model=TableSessionInfo)
async def get_table_session(table: TableSessionInfo = Depends(get_current_table)):
    return table
