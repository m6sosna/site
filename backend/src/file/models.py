from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, TIMESTAMP, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from base import Base


class Folder(Base):
    __tablename__ = "folders"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    parent_folder_id = Column(Integer, ForeignKey('folders.id'), nullable=True)  
    creator_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    
    parent_folder = relationship("Folder", remote_side=[id], backref="subfolders") 
    files = relationship("File", back_populates="folder")

class File(Base):
    __tablename__ = "files"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    file_size = Column(Integer)
    file_path = Column(String)
    folder_id = Column(Integer, ForeignKey("folders.id"))
    uploaded_at = Column(DateTime, default=datetime.utcnow) 
    creator_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    
    folder = relationship("Folder", back_populates="files")