from dotenv import load_dotenv
import os
from pathlib import Path
load_dotenv()

DB_HOST = os.environ.get("DB_HOST")
DB_PORT = os.environ.get("DB_PORT")
DB_NAME = os.environ.get("DB_NAME")
DB_USER = os.environ.get("DB_USER")
DB_PASS = os.environ.get("DB_PASS")

SECRET_AUTH = os.environ.get("SECRET_AUTH")


# Получаем путь к директории проекта
BASE_DIR = Path(__file__).resolve().parent.parent

# Директория для загрузки файлов (относительно директории проекта)
UPLOAD_DIRECTORY = BASE_DIR / "src" / "uploads"