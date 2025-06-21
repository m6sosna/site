import uuid
from typing import Optional
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select, insert, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, Request, APIRouter
from fastapi_users import BaseUserManager, FastAPIUsers, IntegerIDMixin
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase

from auth.database import User, get_user_db, get_async_session
from auth.schemas import SelfUserUpdate, UserRead, UserUpdate, SoloUserRegister, UserCreate
from auth.users import conf, get_user_or_admingeneral, current_active_user, get_user_manager, UserManager

from auth.models import User, Role
    

from sqlalchemy.future import select

router = APIRouter()


@router.get("/me", response_model=UserRead)
async def get_user(user: User = Depends(current_active_user), session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Role).filter(Role.id == user.role_id))
    role = result.scalars().first()
    user_dict = {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "lastname": user.lastname,
        "surname": user.surname,
        "role_id": user.role_id,
        "organisation": user.organisation,
        "is_active": user.is_active,
        "is_superuser": user.is_superuser,
        "is_verified": user.is_verified,
    }
    return UserRead(**user_dict)

@router.patch("/me")
async def update_self_data(
    update_dict: SelfUserUpdate,
    current_user: User = Depends(current_active_user),
    user_manager: UserManager = Depends(get_user_manager),
    session: AsyncSession = Depends(get_async_session),
):
    user_to_update = current_user  
    if user_to_update.role_id == 6:
        update_data = update_dict.dict(exclude_unset=True, exclude={"lastname", "surname", "email"})
    else: update_data = update_dict.dict(exclude_unset=True, exclude={"email"})
    if 'password' in update_data:
        update_data['hashed_password'] = user_manager.password_helper.hash(update_data.pop('password'))
    for key, value in update_data.items():
        setattr(user_to_update, key, value)

    session.add(user_to_update)
    await session.commit()
    return



@router.post("/register")
async def custom_register(
    user_create: SoloUserRegister, 
    user_manager: UserManager = Depends(get_user_manager),
    session: AsyncSession = Depends(get_async_session)
):
    user_data = user_create.dict(exclude_unset=True)
    user_data["role_id"] = 2
    user = await user_manager.create(UserCreate(**user_data))

    await session.commit()
    return user_create

@router.post("/create_user")
async def create_user(
    user_create: UserCreate, 
    user_manager: UserManager = Depends(get_user_manager),
    session: AsyncSession = Depends(get_async_session),
    user: AsyncSession = Depends(get_user_or_admingeneral)
):
    user = await user_manager.create(user_create)
    return user

