from typing import Optional, List
from pydantic import BaseModel
from fastapi_users import schemas

class AnonsCreate(BaseModel):
    content: str
    attachment: Optional[str] = None  # Поле для хранения пути или URL файла

# Схема для обновления анонса
class AnonsUpdate(BaseModel):
    content: Optional[str] = None
    attachment: Optional[str] = None

# Схема для отображения анонса (чтение)
class AnonsRead(BaseModel):
    id: int
    content: str
    attachment: Optional[str] = None

    class Config:
        orm_mode = True