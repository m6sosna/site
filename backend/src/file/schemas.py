from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class File(BaseModel):
    id:int
    filename: str
    file_size: int
    file_path: Optional[str]
    folder_id: Optional[int]
    uploaded_at: datetime
    
    class Config:
        orm_mode = True
        from_attributes = True


class Folder(BaseModel):
    id: int
    name: str
    created_at: datetime
    files: List[File] = []  # Включаем список файлов
    parent_folder_id: Optional[int] = None
    class Config:
        orm_mode = True
        from_attributes = True



class FileCreate(BaseModel):
    filename: str
    file_size: int
    file_path: Optional[str] = None  # Сделаем необязательным
    folder_id: Optional[int] = None
    
    class Config:
        orm_mode = True


# class File(FileBase):
#     id: int
#     uploaded_at: datetime
    
#     class Config:
#         orm_mode = True


# class FolderBase(BaseModel):
#     id: int
#     name: str
#     created_at: datetime
#     files: List[File]

#     class Config:
#         orm_mode = True

class FolderCreate(BaseModel):
     name: str  # имя новой папки
     parent_folder_id: Optional[int] = None  # имя родительской папки, может быть None

     class Config:
        orm_mode = True



class FolderWithFiles(BaseModel):
    id: int
    name: str
    files: List['File']  # Список файлов
    

    class Config:
        orm_mode = True



class DeleteResponse(BaseModel):
    message: str

class CreateSubfolderRequest(BaseModel):
    folder_name: str  # Имя родительской папки
    subfolder_name: str  # Имя новой подпапки


class FolderContents(BaseModel):
    id: int
    name: str
    files: List[File] = []
    subfolders: List['Folder']
    
    class Config:
        orm_mode = True
        from_attributes = True