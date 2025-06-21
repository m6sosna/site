from datetime import datetime
from sqlite3 import IntegrityError
from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import Depends, HTTPException, status
from auth.models import User
from .models import File as FileModel, Folder
from auth.database import get_async_session
import os
import logging
from . import crud, models, schemas
from typing import List
from .schemas import  DeleteResponse, FolderContents, FolderUpdate
from file.schemas import Folder as FolderSchema  
from .models import Folder as FolderModel
from sqlalchemy.orm import joinedload, selectinload
import re
from pathlib import Path
from config import UPLOAD_DIRECTORY
from auth.users import current_active_user

from .crud import get_full_folder_path
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/files",
    tags=["Files"]
)

def sanitize_folder_name(name: str) -> str:
    return "".join(c for c in name if c.isalnum() or c in (' ', '_', '-')).strip()

def sanitize_filename(filename: str) -> str:
    filename = re.sub(r'[<>:"/\\|?*\x00-\x1F]', '_', filename)  
    filename = filename.replace(" ", "_")  
    return filename


@router.get("/all")
async def get_all_files(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(FileModel))
    files = result.scalars().all()
    return files

# @router.post("/upload_files_to_folder")
# async def upload_files(
#     files: list[UploadFile] = File(...), 
#     folder_id: int = Form(...), 
#     db: AsyncSession = Depends(get_async_session),
#     current_user: User = Depends(current_active_user)
# ):
#     # Функция для формирования полного пути к папке
#     async def get_full_folder_path(folder_id: int, db: AsyncSession) -> str:
#         path_parts = []
#         current_folder_id = folder_id

#         while current_folder_id:
#             query = select(FolderModel).where(FolderModel.id == current_folder_id)
#             result = await db.execute(query)
#             current_folder = result.scalar_one_or_none()

#             if not current_folder:
#                 raise HTTPException(status_code=500, detail="Ошибка в структуре папок: папка не найдена")
            
#             path_parts.insert(0, current_folder.name)  # Добавляем имя папки в начало пути
#             current_folder_id = current_folder.parent_folder_id  # Переходим к родительской папке

#         base_path = os.path.join('D:\\', 'ksite', 'backend', 'src', 'uploads')
#         full_path = os.path.join(base_path, *path_parts)
#         return full_path

#     # Получаем полный путь к папке
#     folder_path = await get_full_folder_path(folder_id, db)
#     print(f"Путь к папке для сохранения файлов: {folder_path}")

#     try:
#         os.makedirs(folder_path, exist_ok=True)  # Создаем папку, если она не существует
#         print(f"Папка успешно создана: {folder_path}")
#     except Exception as e:
#         print(f"Ошибка при создании папки: {e}")
#         raise HTTPException(status_code=500, detail="Не удалось создать папку для загрузки файлов")

#     uploaded_files_info = []

#     for file in files:
#         sanitized_filename = sanitize_filename(file.filename)
#         file_path = os.path.join(folder_path, sanitized_filename)
#         print(f"Сохраняем файл: {file_path}")

#         try:
#             content = await file.read()  # Чтение содержимого файла
#             with open(file_path, "wb") as f:
#                 f.write(content)
#             print(f"Файл успешно сохранён: {file_path}")
#         except Exception as e:
#             print(f"Ошибка при сохранении файла {file_path}: {e}")
#             raise HTTPException(status_code=500, detail="Ошибка при сохранении файла")

#         # Вычисляем размер файла
#         file_size = len(content)

#         # Сохраняем информацию о файле в базе данных
#         db_file = FileModel(
#         filename=sanitized_filename, 
#         file_path=file_path, 
#         folder_id=folder_id,
#         file_size=file_size,
#         creator_id=current_user.id  # сохраняем создателя файла
#     )
#         db.add(db_file)
#         uploaded_files_info.append({"filename": sanitized_filename, "file_path": file_path, "file_size": file_size})

#     await db.commit()

#     return {"message": "Файлы успешно загружены", "uploaded_files": uploaded_files_info}


@router.get("/download/{file_id}")
async def download_file(file_id: int, db: AsyncSession = Depends(get_async_session)):
    # Получаем запись о файле из базы данных по ID
    query = select(FileModel).where(FileModel.id == file_id)
    result = await db.execute(query)
    file_entry = result.scalar_one_or_none()

    if not file_entry:
        raise HTTPException(status_code=404, detail="Файл не найден в базе данных")

    # Извлекаем папку, в которой хранится файл
    folder_query = select(FolderModel).where(FolderModel.id == file_entry.folder_id)
    folder_result = await db.execute(folder_query)
    folder = folder_result.scalar_one_or_none()

    if not folder:
        raise HTTPException(status_code=404, detail="Папка не найдена в базе данных")

    # Рекурсивно формируем путь к папке
    async def get_full_folder_path(folder_id: int) -> str:
        query = select(FolderModel).where(FolderModel.id == folder_id)
        result = await db.execute(query)
        folder = result.scalar_one_or_none()

        if not folder:
            raise HTTPException(status_code=404, detail="Папка не найдена в базе данных")

        if folder.parent_folder_id:  # Если есть родительская папка
            parent_path = await get_full_folder_path(folder.parent_folder_id)
            return os.path.join(parent_path, folder.name)
        return folder.name

    # Получаем полный путь к папке относительно `UPLOAD_DIRECTORY`
    relative_folder_path = await get_full_folder_path(folder.id)
    folder_path = UPLOAD_DIRECTORY / relative_folder_path

    # Формируем полный путь к файлу
    sanitized_filename = file_entry.filename
    file_path = folder_path / sanitized_filename

    # Логируем путь к файлу
    print(f"Путь к файлу для скачивания: {file_path}")

    # Проверяем, существует ли файл
    if not file_path.exists():
        print(f"Файл не найден по пути {file_path}")
        raise HTTPException(status_code=404, detail="Файл не найден на сервере")

    # Отправляем файл пользователю
    return FileResponse(file_path, media_type="application/octet-stream", filename=sanitized_filename)




@router.post("/folders/", response_model=schemas.Folder)
async def create_folder(
    folder: schemas.FolderCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user),  
):
    sanitized_name = sanitize_folder_name(folder.name)
    parent_folder_path = UPLOAD_DIRECTORY
    parent_folder_id = None
    if folder.parent_folder_id:
        result = await db.execute(
            select(models.Folder).filter(models.Folder.id == folder.parent_folder_id)
        )
        parent_folder = result.scalars().first()
        if not parent_folder:
            raise HTTPException(status_code=404, detail="Parent folder not found.")
        parent_folder_path = UPLOAD_DIRECTORY / await get_full_folder_path(parent_folder, db)
        parent_folder_id = folder.parent_folder_id
    folder_path = parent_folder_path / sanitized_name
    counter = 1
    unique_folder_path = folder_path
    while unique_folder_path.exists():
        unique_folder_path = folder_path.with_name(f"{sanitized_name}_{counter}")
        counter += 1
    unique_folder_path.mkdir(parents=True, exist_ok=True)
    db_folder = models.Folder(
        name=unique_folder_path.name,
        parent_folder_id=parent_folder_id,
        created_at=datetime.utcnow(),
        creator_id=current_user.id,  
    )
    db.add(db_folder)
    try:
        await db.commit()
        await db.refresh(db_folder)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=400, detail="Unable to create folder due to database constraints."
        )
    result = await db.execute(
        select(models.Folder).options(joinedload(models.Folder.files)).filter(models.Folder.id == db_folder.id)
    )
    db_folder = result.scalars().first()
    return schemas.Folder(
        id=db_folder.id,
        name=db_folder.name,
        created_at=db_folder.created_at,
        parent_folder_id=db_folder.parent_folder_id,
        files=[schemas.File.from_orm(file) for file in db_folder.files],
        creator_id=db_folder.creator_id,
    )



@router.post("/upload_files_to_folder")
async def upload_files(
    files: list[UploadFile] = File(...), 
    folder_id: int = Form(...), 
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user)
):
    query = select(FolderModel).where(FolderModel.id == folder_id)
    result = await db.execute(query)
    folder = result.scalar_one_or_none()
    if not folder:
        raise HTTPException(status_code=404, detail="Папка не найдена")
    if folder.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Вы не являетесь создателем этой папки")
    async def get_full_folder_path(folder_id: int, db: AsyncSession) -> Path:
        path_parts = []
        current_folder_id = folder_id
        while current_folder_id:
            query = select(FolderModel).where(FolderModel.id == current_folder_id)
            result = await db.execute(query)
            current_folder = result.scalar_one_or_none()

            if not current_folder:
                raise HTTPException(status_code=500, detail="Ошибка в структуре папок: папка не найдена")
            
            path_parts.insert(0, current_folder.name)
            current_folder_id = current_folder.parent_folder_id
        return UPLOAD_DIRECTORY.joinpath(*path_parts)
    folder_path = await get_full_folder_path(folder_id, db)
    uploaded_files_info = []
    for file in files:
        sanitized_filename = sanitize_filename(file.filename)
        file_path = folder_path / sanitized_filename
        print(f"Сохраняем файл: {file_path}")
        try:
            content = await file.read()
            with file_path.open("wb") as f:
                f.write(content)
        except Exception as e:
            raise HTTPException(status_code=500, detail="Ошибка при сохранении файла")
        file_size = len(content)
        db_file = FileModel(
            filename=sanitized_filename, 
            file_path=str(file_path), 
            folder_id=folder_id,
            file_size=file_size,
            creator_id=current_user.id
        )
        db.add(db_file)
        uploaded_files_info.append({"filename": sanitized_filename, "file_path": str(file_path), "file_size": file_size})
    await db.commit()
    return {"message": "Файлы успешно загружены", "uploaded_files": uploaded_files_info}




@router.get("/read_folders/", response_model=List[schemas.Folder])
async def read_folders(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_async_session)):
    # Выполняем запрос для получения папок с файлами с использованием joinedload
    result = await db.execute(
        select(models.Folder).options(joinedload(models.Folder.files)).offset(skip).limit(limit)
    )
    
    folders = result.scalars().all()
    logging.info(f"Fetched {len(folders)} folders from the database.")

    folder_data = []
    for folder in folders:
        # Логируем информацию о текущей папке
        logging.info(f"Processing folder: {folder.name}, Files: {len(folder.files)}")

        # Преобразуем список файлов в Pydantic модели
        files = [schemas.File(id=file.id, filename=file.filename, file_size=file.file_size, file_path=file.file_path)
                 for file in folder.files]
        
        # Создаем Pydantic модель для папки и добавляем ее в список
        folder_data.append(schemas.Folder(
            id=folder.id,
            name=folder.name,
            created_at=folder.created_at,
            files=files
        ))

    logging.info(f"Returning {len(folder_data)} folders to the client.")
    return folder_data


@router.get("/folders/{folder_id}/read_files/", response_model=List[schemas.File])
async def get_files_in_folder(folder_id: int, db: AsyncSession = Depends(get_async_session)):
    db_folder = await crud.get_folder(db, folder_id=folder_id)
    if not db_folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    # Получаем список файлов в папке
    files = await crud.get_files_by_folder(db, folder_id=folder_id)
    return files


# @router.delete("/delete_folder/{folder_id}", response_model=dict)
# async def delete_folder(folder_id: int, db: AsyncSession = Depends(get_async_session)):
#     # Находим папку в базе данных
#     folder_query = select(Folder).where(Folder.id == folder_id)
#     folder_result = await db.execute(folder_query)
#     folder_entry = folder_result.scalar_one_or_none()

#     if not folder_entry:
#         raise HTTPException(status_code=404, detail="Папка не найдена")

#     # Запускаем рекурсивное удаление
#     await crud.delete_folder_recursively(folder_entry, db)

#     # Сохраняем изменения в базе данных
#     await db.commit()

#     return {"message": "Папка и все её вложения успешно удалены"}

@router.delete("/delete_folder/{folder_id}", response_model=dict)
async def delete_folder(
    folder_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user)  
):

    folder_query = select(Folder).where(Folder.id == folder_id)
    folder_result = await db.execute(folder_query)
    folder_entry = folder_result.scalar_one_or_none()

    if not folder_entry:
        raise HTTPException(status_code=404, detail="Папка не найдена")

    if folder_entry.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав на удаление этой папки"
        )


    await crud.delete_folder_recursively(folder_entry, db)

    await db.commit()

    return {"message": "Папка и все её вложения успешно удалены"}




@router.get("/files/folders/{folder_id}/contents", response_model=schemas.FolderContents)
async def get_folder_contents(folder_id: int, db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(
        select(FolderModel)
        .options(selectinload(FolderModel.files), selectinload(FolderModel.subfolders))
        .where(FolderModel.id == folder_id)
    )
    folder = result.scalar_one_or_none()

    if not folder:
        raise HTTPException(status_code=404, detail=f"Папка с id {folder_id} не найдена.")

    files = [
        schemas.File(
            id=file.id,
            filename=file.filename,
            file_size=file.file_size,
            file_path=file.file_path,
            folder_id=file.folder_id,
            uploaded_at=file.uploaded_at,
            creator_id=file.creator_id
        )
        for file in folder.files
    ]

    subfolders = [
        schemas.Folder(
            id=subfolder.id,
            name=subfolder.name,
            created_at=subfolder.created_at,
            files=[],  # или subfolder.files если надо вложенные файлы сразу
            parent_folder_id=subfolder.parent_folder_id,
            creator_id=subfolder.creator_id
        )
        for subfolder in folder.subfolders
    ]

    return schemas.FolderContents(
    id=folder.id,
    name=folder.name,
    parent_folder_id=folder.parent_folder_id,
    creator_id=folder.creator_id,
    files=files,
    subfolders=subfolders
)

@router.get("/folders", response_model=list[FolderSchema])
async def get_folders(db: AsyncSession = Depends(get_async_session)):
    # Выполняем запрос с подгрузкой файлов
    result = await db.execute(select(FolderModel).options(joinedload(FolderModel.files)))
    
    # Используем unique(), чтобы избежать проблемы с дублированными данными
    folders = result.unique().scalars().all()

    if not folders:
        raise HTTPException(status_code=404, detail="Folders not found")

    # Преобразуем в Pydantic модели, включая файлы
    # Обрабатываем ситуацию с отсутствующим file_size
    for folder in folders:
        for file in folder.files:
            if file.file_size is None:
                file.file_size = 0  # Устанавливаем значение по умолчанию, если file_size отсутствует

    return [FolderSchema.from_orm(folder) for folder in folders]

@router.delete("/files/delete/{file_id}", response_model=dict)
async def delete_file(
    file_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user)
):
    query = select(FileModel).where(FileModel.id == file_id)
    result = await db.execute(query)
    file = result.scalar_one_or_none()

    if not file:
        raise HTTPException(status_code=404, detail="Файл не найден")

    if file.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Вы не можете удалить этот файл")

    # Удаляем файл с диска
    try:
        os.remove(file.file_path)
    except FileNotFoundError:
        pass  # файл уже отсутствует

    # Удаляем из базы
    await db.delete(file)
    await db.commit()

    return {"message": "Файл успешно удалён"}


# @router.put("/folders/{folder_id}")
# async def update_folder_name(folder_id: int, folder_update: FolderUpdate, db: AsyncSession = Depends(get_async_session)):
#     # Найти папку по ID
#     folder = await db.execute(select(Folder).filter(Folder.id == folder_id))
#     folder = folder.scalars().first()

#     if not folder:
#         raise HTTPException(status_code=404, detail="Папка не найдена")

#     # Проверка на уникальность нового имени
#     existing_folder = await db.execute(select(Folder).filter(Folder.name == folder_update.name))
#     existing_folder = existing_folder.scalars().first()
#     if existing_folder:
#         raise HTTPException(status_code=400, detail="Папка с таким именем уже существует")

#     # Получаем полный путь старой папки
#     old_folder_path = await get_full_folder_path(folder, db)
#     new_folder_path = os.path.join(os.path.dirname(old_folder_path), folder_update.name)  # Новый путь

#     # Переименование папки в файловой системе
#     try:
#         os.rename(old_folder_path, new_folder_path)
#     except OSError as e:
#         raise HTTPException(status_code=500, detail=f"Ошибка переименования папки в файловой системе: {e}")

#     # Обновление имени папки в базе данных
#     folder.name = folder_update.name
#     await db.commit()
#     await db.refresh(folder)

#     return {"message": "Имя папки успешно обновлено", "folder": {"id": folder.id, "name": folder.name}}
@router.put("/folders/{folder_id}")
async def update_folder_name(
    folder_id: int,
    folder_update: FolderUpdate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user)
):
    folder = await db.execute(select(Folder).filter(Folder.id == folder_id))
    folder = folder.scalars().first()

    if not folder:
        raise HTTPException(status_code=404, detail="Папка не найдена")

    # Проверка владельца
    if folder.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Вы не являетесь владельцем этой папки")

    # Проверка уникальности
    existing_folder = await db.execute(select(Folder).filter(Folder.name == folder_update.name))
    existing_folder = existing_folder.scalars().first()
    if existing_folder:
        raise HTTPException(status_code=400, detail="Папка с таким именем уже существует")

    # Переименование
    old_folder_path = await get_full_folder_path(folder, db)
    new_folder_path = os.path.join(os.path.dirname(old_folder_path), folder_update.name)

    try:
        os.rename(old_folder_path, new_folder_path)
    except OSError as e:
        raise HTTPException(status_code=500, detail=f"Ошибка переименования: {e}")

    folder.name = folder_update.name
    await db.commit()
    await db.refresh(folder)

    return {"message": "Имя папки успешно обновлено", "folder": {"id": folder.id, "name": folder.name}}
