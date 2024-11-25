from fastapi import Depends, FastAPI, HTTPException
from auth.users import fastapi_users, auth_backend
from auth.schemas import UserCreate, UserRead, UserUpdate
from fastapi.middleware.cors import CORSMiddleware
from auth.rolerouter import router as router_roles
from auth.router import router as auth_router
from fastapi.responses import FileResponse
import os
from file.file_router import router as file_router
from anons.router import router as anons_router
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
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
UPLOAD_DIRECTORY = "uploads/"  # Например, 'uploads/' 

# @app.get("/files/{file_name}")
# async def download_file(file_name: str):
#     file_path = os.path.join(UPLOAD_DIRECTORY, file_name)
    
#     # Проверка на существование файла
#     if not os.path.isfile(file_path):
#         raise HTTPException(status_code=404, detail="Файл не найден")
    
#     # Возврат файла в ответе
#     return FileResponse(file_path, media_type="application/octet-stream", filename=file_name)
