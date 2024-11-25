from datetime import datetime
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable

from sqlalchemy import Table, Column, Integer, String, TIMESTAMP, ForeignKey, JSON, Boolean, MetaData
from sqlalchemy.orm import relationship
from base import Base


class Role(Base):
    __tablename__ = "role"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    users = relationship("User", back_populates="role")


class User(SQLAlchemyBaseUserTable[int], Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True)
    email = Column(String, nullable=False, unique = True)
    name = Column(String, nullable=False)
    lastname = Column(String, nullable=True)
    surname = Column(String, nullable=True)
    organisation = Column(String, nullable=True)
    registered_at = Column(TIMESTAMP, default=datetime.utcnow)
    role_id = Column(Integer, ForeignKey("role.id"), nullable=False)
    hashed_password: str = Column(String(length=1024), nullable=False)
    is_active: bool = Column(Boolean, default=True, nullable=False)
    is_superuser: bool = Column(Boolean, default=False, nullable=False)
    is_verified: bool = Column(Boolean, default=False, nullable=False)
    
    role = relationship("Role", back_populates="users")
 

