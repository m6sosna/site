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
    creator_id: int
    
    class Config:
        orm_mode = True
        from_attributes = True


class Folder(BaseModel):
    id: int
    name: str
    created_at: datetime
    files: List[File] = [] 
    parent_folder_id: Optional[int] = None
    creator_id: int
    class Config:
        orm_mode = True
        from_attributes = True



class FolderCreate(BaseModel):
    name: str
    parent_folder_id: Optional[int] = None



class FolderWithFiles(BaseModel):
    id: int
    name: str
    files: List['File']  

    class Config:
        orm_mode = True
class DeleteResponse(BaseModel):
    message: str

class CreateSubfolderRequest(BaseModel):
    folder_name: str  
    subfolder_name: str  

class FolderContents(BaseModel):
    id: int
    name: str
    parent_folder_id: Optional[int] = None
    creator_id: int
    files: List[File] = []
    subfolders: List[Folder] = []
    
    class Config:
        orm_mode = True
        from_attributes = True

class FolderUpdate(BaseModel):
    name: str
    creator_id: int
    