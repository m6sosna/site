import uuid
from typing import Optional, List
from pydantic import BaseModel
from fastapi_users import schemas


class UserRead(schemas.BaseUser[int]):
    id: int
    email: str
    name: str
    lastname: Optional[str] = ""
    surname: Optional[str] = ""
    role_id: int
    
    organisation: str
    is_active: bool = True
    is_superuser: bool = False
    is_verified: bool = False

    class Config:
        orm_mode = True

class UserCreate(schemas.BaseUserCreate):
    name: str
    lastname:str
    surname: str
    email: str
    password: str
    role_id: Optional[int] = 2
    organisation: str
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False
    is_verified: Optional[bool] = False


class SoloUserRegister(schemas.BaseUserCreate):
    name: str
    lastname: Optional[str] = None
    surname: Optional[str] = None
    email: str
    password: str
    role_id: Optional[int] = 1
    organisation: str
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False
    is_verified: Optional[bool] = False



class UserUpdate(schemas.BaseUserUpdate):
    name: str
    lastname: str
    surname:str
    password: Optional[str] = None
    role_id: int
   
    is_active: bool = True
    is_superuser: bool = False
    is_verified: bool = False

class SelfUserUpdate(schemas.BaseUserUpdate):
    name: Optional[str] = None
    lastname: Optional[str] = None
    surname:Optional[str] = None
    password: Optional[str] = None
   
    is_active: bool = True
    is_superuser: bool = False
    is_verified: bool = False
class RoleRead(BaseModel):
     id: int
     name: str

     class Config:
         orm_mode = True
class RoleCreate(BaseModel):
    name: str
class RoleUpdate(BaseModel):
    name: str