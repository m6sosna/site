import os
from pathlib import Path
import shutil
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from config import UPLOAD_DIRECTORY
from .models import anons  # Импорт модели анонсов
from .schemas import AnonsCreate, AnonsRead  # Импорт схем
from auth.database import get_async_session  # Функция для получения сессии базы данных
from auth.models import User
from auth.users import current_active_user
router = APIRouter(
    prefix="/anons",
    tags=["Anons"]
)


# Создание нового анонса
@router.post("/anonses/", response_model=AnonsCreate)
async def create_anons(
    content: str = Form(...),
    attachment: UploadFile = File(None),
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user)
):
    new_anons = anons(
        content=content,
        creator_id=current_user.id
    )

    if attachment:
        file_path = os.path.join(UPLOAD_DIRECTORY, attachment.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(attachment.file, buffer)
        new_anons.attachment = file_path

    db.add(new_anons)
    await db.commit()
    await db.refresh(new_anons)
    return new_anons
# Обновление существующего анонса
@router.put("/anonses/{anons_id}", response_model=AnonsRead)
async def update_anons(
    anons_id: int,
    content: Optional[str] = Form(None),
    attachment: UploadFile = File(None),
    delete_attachment: bool = Form(False),
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user),
):
    result = await db.execute(select(anons).where(anons.id == anons_id))
    anons_obj = result.scalars().first()

    if not anons_obj:
        raise HTTPException(status_code=404, detail="Anons not found")

    # Проверка прав на редактирование
    if anons_obj.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not allowed to edit this anons.")

    if content:
        anons_obj.content = content

    # Определяем текущий путь к файлу
    if anons_obj.attachment:
        attachment_path = Path(UPLOAD_DIRECTORY / anons_obj.attachment)
        if not attachment_path.is_relative_to(UPLOAD_DIRECTORY):
            attachment_path = UPLOAD_DIRECTORY / anons_obj.attachment
    else:
        attachment_path = None

    # Удаление вложения
    if (delete_attachment or attachment) and attachment_path and attachment_path.exists():
        attachment_path.unlink()
        anons_obj.attachment = None

    # Сохранение нового файла
    if attachment:
        new_file_path = UPLOAD_DIRECTORY / attachment.filename
        with open(new_file_path, "wb") as buffer:
            shutil.copyfileobj(attachment.file, buffer)
        anons_obj.attachment = attachment.filename

    await db.commit()
    await db.refresh(anons_obj)
    return anons_obj




# Удаление анонса
@router.delete("/anonses/{anons_id}", response_model=dict)
async def delete_anons(anons_id: int, db: AsyncSession = Depends(get_async_session)):
    # Поиск анонса по идентификатору
    result = await db.execute(select(anons).where(anons.id == anons_id))
    found_anons = result.scalars().first()
    
    if not found_anons:
        raise HTTPException(status_code=404, detail="Anons not found")

    # Удаление файла, если он существует
    if found_anons.attachment and os.path.exists(found_anons.attachment):
        os.remove(found_anons.attachment)

    # Удаляем анонс из базы данных
    await db.delete(found_anons)
    await db.commit()
    
    return {"status": "deleted"}

@router.get("/anonses/", response_model=List[AnonsRead])
async def get_all_anonses(db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(anons))
    anonses = result.scalars().all()
    return anonses

@router.get("/anonses/{anons_id}/download")
async def download_attachment(anons_id: int, db: AsyncSession = Depends(get_async_session)):
    # Находим анонс по ID
    result = await db.execute(select(anons).where(anons.id == anons_id))
    anons_item = result.scalars().first()

    if not anons_item:
        raise HTTPException(status_code=404, detail="Anons not found")
    
    # Проверяем наличие attachment
    if not anons_item.attachment or not os.path.exists(anons_item.attachment):
        raise HTTPException(status_code=404, detail="Attachment not found")

    # Отправляем файл в ответ
    return FileResponse(anons_item.attachment, media_type='application/octet-stream', filename=os.path.basename(anons_item.attachment))