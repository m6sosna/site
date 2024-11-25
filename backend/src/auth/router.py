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
# from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

from sqlalchemy.future import select

router = APIRouter()

# @router.get("/all", response_model=list[UserRead])
# async def get_all_users(
#     session: AsyncSession = Depends(get_async_session),
#     user: User = Depends(current_active_user)
# ):
#     if user.role_id == 2:
#         users_query = select(User).filter(User.role_id != 2)
#     elif user.role_id == 3:
#         users_query = select(User).filter(~User.role_id.in_([2, 3]))
#     else:
#         raise HTTPException(status_code=403, detail="Недостаточно прав")

#     result = await session.execute(users_query)
#     users = result.scalars().all()
#     user_ids = [user.id for user in users]

#     registered_olymp_query = select(RegisteredOlymp).filter(RegisteredOlymp.user_id.in_(user_ids))
#     result = await session.execute(registered_olymp_query)
#     registered_olymps = result.scalars().all()
#     registered_olymp_dict = {registered_olymp.user_id: registered_olymp for registered_olymp in registered_olymps}

#     team_members_query = select(TeamMembers).filter(TeamMembers.team_id.in_(user_ids))
#     result = await session.execute(team_members_query)
#     team_members = result.scalars().all()
#     team_members_dict = {team_member.team_id: [] for team_member in team_members}
#     for team_member in team_members:
#         team_members_dict[team_member.team_id].append(team_member)

#     roles_query = select(Role).filter(Role.id.in_([user.role_id for user in users]))
#     result = await session.execute(roles_query)
#     roles = result.scalars().all()
#     role_dict = {role.id: role for role in roles}


#     users_dict = []
#     for user in users:
#         registered_olymp = registered_olymp_dict.get(user.id)
#         members = team_members_dict.get(user.id, [])
#         role = role_dict.get(user.role_id)

#         members_pydantic = [TeamMembersRead.from_orm(member) for member in members]
#         user_dict = {
#             "id": user.id,
#             "email": user.email,
#             "name": user.name,
#             "lastname": user.lastname,
#             "surname": user.surname,
#             "role_id": user.role_id,
#             "role_name": role.name if role else None,
#             "organisation": user.organisation,
#             "olymp_id": registered_olymp.olymp_id if registered_olymp else None,
#             "members": members_pydantic,
#             "is_active": user.is_active,
#             "is_superuser": user.is_superuser,
#             "is_verified": user.is_verified,
#         }
#         users_dict.append(UserRead(**user_dict))
#     return users_dict
# @router.get('/experts')
# async def get_users(
#     act_user: User = Depends(current_active_user),
# session: AsyncSession = Depends(get_async_session)):
#     query = select(User).where(User.role_id.in_([3, 4]))
#     result = await session.execute(query)
#     experts = result.scalars().all()

#     return experts
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

    
# @router.patch("/{user_id}")
# async def update_user(
#     user_id: int,
#     update_dict: UserUpdate,
#     user: User = Depends(get_user_or_admingeneral),
#     user_manager: UserManager = Depends(get_user_manager),
#     session: AsyncSession = Depends(get_async_session),
# ):
#     result = await session.execute(select(User).filter(User.id == user_id))
#     user_to_update = result.scalars().first()
#     if not user_to_update:
#         raise HTTPException(status_code=404, detail="Пользователь не найден")
#     if ((user.role_id == 2 and user_to_update.role_id == 2) or (user.role_id == 3 and user_to_update.role_id in [2, 3])):
#         raise HTTPException(status_code=404, detail="Недостаточно прав")

#     update_data = update_dict.dict(exclude_unset=True)
#     if 'password' in update_data:
#         update_data['hashed_password'] = user_manager.password_helper.hash(update_data.pop('password'))

#     for key, value in update_data.items():
#         setattr(user_to_update, key, value)

#     if user_to_update.role_id == 6:
#         if update_dict.members:
#             for member_data in update_dict.members:
#                 member = await session.get(TeamMembers, member_data.id)
#                 if not member:
#                     raise HTTPException(status_code=404, detail=f"Team member with id {member_data.id} not found")

#                 for key, value in member_data.dict(exclude_unset=True).items():
#                     setattr(member, key, value)

#                 session.add(member)
#     session.add(user_to_update)
#     await session.commit()
#     return
# @router.delete("/{user_id}", response_model=None)
# async def delete_user(
#     user_id: int,
#     user: User = Depends(get_user_or_admingeneral),
#     user_manager = Depends(get_user_manager),
#     session: AsyncSession = Depends(get_async_session),
# ):
#     result = await session.execute(select(User).filter(User.id == user_id))
#     user_to_delete = result.scalars().first()

#     if not user_to_delete:
#         raise HTTPException(status_code=404, detail="Пользователь не найден")

#     if ((user.role_id == 2 and user_to_delete.role_id == 2) or 
#         (user.role_id == 3 and user_to_delete.role_id in [2, 3])):
#         raise HTTPException(status_code=404, detail="Недостаточно прав")
#     if user_to_delete.role_id in [5,6]:
#         await delete_answers_by_user(session, user_to_delete.id)
#     await user_manager.delete(user_to_delete)

#     return None
# @router.post("/teamregister")
# async def custom_teamregister(
#     user_create: TeamUserRegister, 
#     user_manager: UserManager = Depends(get_user_manager),
#     session: AsyncSession = Depends(get_async_session)
# ):
#     user_data = user_create.dict(exclude={"olymp_id", "members"})
#     user_data["role_id"] = 6
#     user = await user_manager.create(TeamUserCreate(**user_data))
    
#     registered_olymp = RegisteredOlymp(user_id=user.id, olymp_id=user_create.olymp_id)
#     session.add(registered_olymp)
    
#     result = await session.execute(select(Role).filter(Role.id == user.role_id))
#     role = result.scalars().first()
#     print(f"Registered Olymp for user {user.id} with Olymp ID {user_create.olymp_id}")

#     for member in user_create.members:
#             team_member = TeamMembers(
#                 team_id=user.id,
#                 name=member.name,
#                 lastname=member.lastname,
#                 surname=member.surname
#             )
#             session.add(team_member)
#             print(f"Added Team Member {member.name} {member.lastname} to team ID {user.id}")

#     await session.commit()

#     return user_create

@router.post("/register")
async def custom_register(
    user_create: SoloUserRegister, 
    user_manager: UserManager = Depends(get_user_manager),
    session: AsyncSession = Depends(get_async_session)
):
    user_data = user_create.dict(exclude_unset=True)
    user_data["role_id"] = 1
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

