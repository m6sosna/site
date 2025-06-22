from fastapi import Depends, FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from auth.users import fastapi_users, auth_backend
from auth.schemas import UserCreate, UserRead, UserUpdate
from fastapi.middleware.cors import CORSMiddleware
from auth.rolerouter import router as router_roles
from auth.router import router as auth_router
from fastapi.responses import FileResponse
import os
from config import BASE_DIR
from file.file_router import router as file_router
from anons.router import router as anons_router
app = FastAPI()

origins = [
    "http://localhost:3000",  # адрес твоего фронтенда
]
app.add_middleware(
    
    CORSMiddleware,
    allow_origins=origins,  # или ["*"] для всех источников (не рекомендуется на проде)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(
    file_router
)
app.include_router(
    anons_router
)
@app.get("/download-book")
async def download_book():
    path = "static/book.docx"
    return FileResponse(path, media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', filename="book.docx")
@app.get("/")
async def serve_index():
    return FileResponse(os.path.join("build", "index.html"))


BUILD_DIR = os.path.abspath(os.path.join(BASE_DIR, "./../frontend/public"))  # поднимаемся к /ksite/build

app.mount("/", StaticFiles(directory=BUILD_DIR, html=True), name="index.html")

app.include_router(
    fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"]
)

app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)
app.include_router(auth_router, prefix="/customusers", tags=["reg"])
@app.get("/")
async def root():
    return {"message": "Testing your app"}

