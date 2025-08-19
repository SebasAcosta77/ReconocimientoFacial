from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from src.services.face_recognition_service import FaceRecognitionService
from src.services.face_registration_service import FaceRegistrationService
from src.models import RegisterFaceRequest
import cv2
import asyncio

api = APIRouter()
face_service = FaceRecognitionService()
face_registration_service = FaceRegistrationService()

@api.post("/start")
async def start_recognition(request: Request):
    try:
        body = await request.json()
        cod_evento = body.get("cod_evento")
        token = request.headers.get("authorization")

        if not token:
            raise HTTPException(status_code=401, detail="Token JWT requerido")

        token = token.replace("Bearer ", "")
        face_service.set_token(token)

        if not cod_evento or not isinstance(cod_evento, int):
            raise HTTPException(status_code=400, detail="cod_evento es requerido y debe ser un número entero")

        # Inicia el reconocimiento facial
        response = await face_service.start_recognition(cod_evento)
        return {"status": response.get("status", "Reconocimiento iniciado"), "cod_evento": cod_evento}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al iniciar el reconocimiento: {str(e)}")

@api.post("/stop")
async def stop_recognition():
    try:
        response = face_service.stop_recognition()
        return {"status": response.get("status", "Reconocimiento detenido")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al detener el reconocimiento: {str(e)}")

@api.post("/register_face_start")
async def register_face_start(request: Request):
    try:
        token = request.headers.get("authorization")
        if not token:
            raise HTTPException(status_code=401, detail="Token JWT requerido")
        token = token.replace("Bearer ", "")
        face_registration_service.set_token(token)
        return await face_registration_service.start_stream()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al iniciar el stream: {str(e)}")

@api.post("/register_face_stop")
async def register_face_stop():
    try:
        return await face_registration_service.stop_stream()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al detener el stream: {str(e)}")

@api.post("/register_face_capture")
async def register_face_capture(request: Request):
    try:
        body = await request.json()
        cod_usuario = body.get("cod_usuario")
        if not cod_usuario:
            raise HTTPException(status_code=400, detail="Falta el campo 'cod_usuario'")
        
        token = request.headers.get("authorization")
        if not token:
            raise HTTPException(status_code=401, detail="Token JWT requerido")
        token = token.replace("Bearer ", "")
        face_registration_service.set_token(token)

        return await face_registration_service.capture_and_register_face(cod_usuario)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar rostro: {str(e)}")    


@api.get("/video_feed")
async def video_feed():
    try:
        if not face_service.is_running:
            raise HTTPException(status_code=400, detail="El reconocimiento no está en ejecución")
        return StreamingResponse(face_service.gen_stream(), media_type="multipart/x-mixed-replace; boundary=frame")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al transmitir el video: {str(e)}")



@api.get("/register_face_feed")
async def register_face_feed():
    try:
        print(f"Verificando streaming: is_streaming = {face_registration_service.is_streaming}")  # Depuración
        if not face_registration_service.is_streaming:
            raise HTTPException(status_code=400, detail="El stream de registro no está en ejecución")
        return StreamingResponse(face_registration_service.gen_stream(), media_type="multipart/x-mixed-replace; boundary=frame")
    except Exception as e:
        print(f"Error en register_face_feed: {e}")  # Depuración
        raise HTTPException(status_code=500, detail=f"Error al transmitir el stream de registro: {str(e)}")
