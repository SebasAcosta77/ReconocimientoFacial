# src/api/routes.py
from fastapi import APIRouter, HTTPException
from src.services.face_recognition_service import FaceRecognitionService
from src.services.face_registration_service import FaceRegistrationService
from src.models import StartRecognitionRequest, RegisterFaceRequest

api = APIRouter()
face_service = FaceRecognitionService()  # Sin nestjs_api_url
face_registration_service = FaceRegistrationService()

@api.post("/start")
async def start_recognition(data: dict):
    cod_evento = data.get("cod_evento")
    if not cod_evento:
        return {"error": "cod_evento es requerido"}
    return await face_service.start_recognition(cod_evento)

@api.post("/stop")
async def stop_recognition():
    return face_service.stop_recognition()

@api.post("/register_face")
async def register_face(request: RegisterFaceRequest):
    try:
        return await face_registration_service.capture_and_register_face(request.cod_usuario)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar rostro: {str(e)}")