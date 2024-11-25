from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, TIMESTAMP, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from base import Base


class anons(Base):
    __tablename__ = "anonses"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, index=True)
    attachment = Column(String)
    