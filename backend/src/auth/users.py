import uuid
from typing import Optional
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
# from auth.schemas import UserRead, UserUpdate, SoloUserRegister, TeamUserRegister, UserCreate
# from olymp.models import TeamMembers, RegisteredOlymp
# from olymp.schemas import TeamMembersRead
from auth.models import User, Role
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME="",
    MAIL_PASSWORD="",
    MAIL_FROM="your_email@example.com",
    MAIL_PORT=1025,
    MAIL_SERVER="localhost",
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=False,
    VALIDATE_CERTS=False
)
SECRET = "SECRET"


class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        await self.request_verify(user, request)
        

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"Verification requested for user {user.id}. Verification token: {token}")

async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=86400)


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, int](get_user_manager, [auth_backend])

current_active_user = fastapi_users.current_user(active=True)
current_superuser = fastapi_users.current_user(active=True, superuser=True)


async def get_user_or_admingeneral(
    act_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    if act_user.role_id == 3 or act_user.role_id == 2 or act_user.is_superuser:
        return act_user
    else:
        raise HTTPException(status_code=403, detail="Not enough permissions")

async def get_expert_or_org(
    act_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    if act_user.role_id == 3 or act_user.role_id == 4:
        return act_user
    else:
        raise HTTPException(status_code=403, detail="Not enough permissions")
