from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, TIMESTAMP, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from base import Base


class Folder(Base):
    __tablename__ = "folders"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    parent_folder_id = Column(Integer, ForeignKey('folders.id'), nullable=True)  # Родительская папка
    
    
    parent_folder = relationship("Folder", remote_side=[id], backref="subfolders")  # Связь с родительской папкой
    files = relationship("File", back_populates="folder")
    # subfolders = relationship("Folder", backref="parent_folder", remote_side=[parent_folder_id])

# class Folder(Base):
#     __tablename__ = "folders"
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String, index=True)
#     parent_id = Column(Integer, ForeignKey("folders.id"), nullable=True)

#     # Связи
#     files = relationship("FileModel", back_populates="folder")
#     subfolders = relationship("FolderModel", back_populates="parent_folder")
#     parent_folder = relationship("FolderModel", remote_side=[id])

class File(Base):
    __tablename__ = "files"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    file_size = Column(Integer)
    file_path = Column(String)
    folder_id = Column(Integer, ForeignKey("folders.id"))
    uploaded_at = Column(DateTime, default=datetime.utcnow) 
    # Определяем связь с Folder через back_populates
    folder = relationship("Folder", back_populates="files")