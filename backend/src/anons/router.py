import os
import shutil
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from config import UPLOAD_DIRECTORY
from .models import anons  # Импорт модели анонсов
from .schemas import AnonsCreate, AnonsRead  # Импорт схем
from auth.database import get_async_session  # Функция для получения сессии базы данных

router = APIRouter(
    prefix="/anons",
    tags=["Anons"]
)


# Создание нового анонса
@router.post("/anonses/", response_model=AnonsRead)
async def create_anons(
    content: str = Form(...),
    attachment: UploadFile = File(None),
    db: AsyncSession = Depends(get_async_session)
):
    new_anons = anons(content=content)

    # Сохранение файла, если он прикреплен
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
    delete_attachment: bool = Form(False),  # Изменение Query на Form
    db: AsyncSession = Depends(get_async_session)
):
    result = await db.execute(select(anons).where(anons.id == anons_id))
    anons_obj = result.scalars().first()

    if not anons_obj:
        raise HTTPException(status_code=404, detail="Anons not found")

    if content:
        anons_obj.content = content

    current_file_path = (
    os.path.join(UPLOAD_DIRECTORY, anons_obj.attachment) 
    if anons_obj.attachment and not anons_obj.attachment.startswith(UPLOAD_DIRECTORY) 
    else anons_obj.attachment
)
    print(f"Current file path: {current_file_path}")
    print(f"Delete attachment flag: {delete_attachment}")
    print(f"New attachment provided: {attachment is not None}")

    if (delete_attachment or attachment) and current_file_path:
        if os.path.exists(current_file_path):
            print(f"Deleting file: {current_file_path}")
            os.remove(current_file_path)
            anons_obj.attachment = None
        else:
            print(f"File not found at path: {current_file_path}")

    if attachment:
        new_file_path = os.path.join(UPLOAD_DIRECTORY, attachment.filename)
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