import os
from pathlib import Path
import shutil
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from config import UPLOAD_DIRECTORY
from . import models, schemas
from .models import File, Folder
from sqlalchemy.orm import selectinload
from .models import File as FileModel
from .models import Folder as FolderModel


async def create_folder(db: AsyncSession, folder: schemas.Folder):
    db_folder = models.Folder(name=folder.name, parent_folder_id=folder.parent_folder_id)
    
    db.add(db_folder)
    await db.commit()  # Асинхронная коммитация
    await db.refresh(db_folder)  # Асинхронное обновление объекта
    return db_folder

async def get_folder(db: AsyncSession, folder_id: int):
    result = await db.execute(select(models.Folder).filter(models.Folder.id == folder_id))
    return result.scalars().first()


async def create_file(db: AsyncSession, file: schemas.File, folder_id: int, file_path: str):
    # Создаем объект File с необходимыми данными
    db_file = File(
        filename=file.filename,
        file_path=file_path,  # Сохраняем путь к файлу
        file_size=file.file_size,
        folder_id=folder_id
    )

    # Добавляем в базу данных и сохраняем изменения
    db.add(db_file)
    await db.commit()
    await db.refresh(db_file)
    return db_file


async def get_full_folder_path(folder: Folder, db: AsyncSession) -> str:
    path_parts = [folder.name]  
    current_folder = folder
    print(f"Начинаем формирование пути для папки: {folder.name}")
    while current_folder.parent_folder_id:
        query = select(Folder).where(Folder.id == current_folder.parent_folder_id)
        result = await db.execute(query)
        current_folder = result.scalar_one_or_none()
        if not current_folder:
            raise HTTPException(status_code=500, detail="Ошибка в структуре папок")
        
        path_parts.insert(0, current_folder.name)  
    full_path = UPLOAD_DIRECTORY / Path(*path_parts) 
    return str(full_path) 


async def delete_folder_recursively(folder: FolderModel, db: AsyncSession):
 
    files_query = select(File).where(File.folder_id == folder.id)
    files_result = await db.execute(files_query)
    files = files_result.scalars().all()

    for file in files:
        file_path = Path(file.file_path)
        if file_path.exists():
            try:
                print(f"Удаление файла: {file_path}")
                file_path.unlink()  
            except Exception as e:
                print(f"Ошибка при удалении файла {file_path}: {e}")
        await db.delete(file)

    subfolders_query = select(Folder).where(Folder.parent_folder_id == folder.id)
    subfolders_result = await db.execute(subfolders_query)
    subfolders = subfolders_result.scalars().all()

    for subfolder in subfolders:
        print(f"Рекурсивное удаление подпапки: {subfolder.name}")
        await delete_folder_recursively(subfolder, db)

    await db.delete(folder)

    folder_path = await get_full_folder_path(folder, db)
    if Path(folder_path).exists():
        try:
            shutil.rmtree(folder_path)  
            print(f"Папка успешно удалена: {folder_path}")
        except PermissionError as e:
            print(f"Ошибка доступа к папке {folder_path}: {e}")
        except FileNotFoundError:
            print(f"Папка уже была удалена: {folder_path}")
        except Exception as e:
            print(f"Неизвестная ошибка при удалении папки {folder_path}: {e}")
    else:
        print(f"Папка не существует: {folder_path}")
        