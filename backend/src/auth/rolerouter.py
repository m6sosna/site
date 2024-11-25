from fastapi import APIRouter, Depends
from sqlalchemy import select, insert, delete, update
from sqlalchemy.ext.asyncio import AsyncSession

from auth.database import get_async_session
from auth.models import Role
from pydantic import BaseModel
from typing import List
from auth.users import current_active_user, current_superuser
from auth.schemas import RoleRead

router = APIRouter(
    prefix="/roles",
    tags=["Roles"]
)

@router.get("/{role_id}",  response_model=RoleRead)
async def get_roles( role_id:int, session: AsyncSession = Depends(get_async_session)):
    query = select(Role).where(Role.id == role_id)
    result = await session.execute(query)
    return result.scalars().first()
    #return result.mappings().all()
@router.get("/get/all")
async def get_allroles(session: AsyncSession = Depends(get_async_session)):
    query = select(Role)
    result = await session.execute(query)
    return result.scalars().all()
    #return result.mappings().all()
    