from pydantic import BaseModel

class StartRecognitionRequest(BaseModel):
    cod_evento: int

class RegisterFaceRequest(BaseModel):
    cod_usuario: str