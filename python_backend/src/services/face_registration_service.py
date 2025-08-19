import cv2
import face_recognition
import requests
import os
import uuid
import base64
import asyncio

class FaceRegistrationService:
    def __init__(self):
        self.camera_index = 0  # Prueba cambiar a 1 si falla
        self.nest_api_url = "http://localhost:3550"
        self.image_dir = "C:/desarrollo/back_comptervision/src/doc/img/usuario"
        self.jwt_token = ""
        self.is_streaming = False
        self.current_frame = None
        self.capture_flag = False
        self.cap = None  # Variable para almacenar el objeto de captura

    def set_token(self, token: str):
        self.jwt_token = token

    def get_auth_headers(self):
        return {"Authorization": f"Bearer {self.jwt_token}"} if self.jwt_token else {}

    async def gen_stream(self):
        """Generar flujo MJPEG desde el fotograma actual de forma asíncrona."""
        print("Iniciando gen_stream...")  # Depuración
        self.cap = cv2.VideoCapture(self.camera_index, cv2.CAP_DSHOW)
        if not self.cap.isOpened():
            print(f"Error: No se pudo abrir la cámara en el índice {self.camera_index}")  # Depuración
            raise Exception(f"Failed to open camera at index {self.camera_index}")

        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

        try:
            while self.is_streaming:
                ret, frame = self.cap.read()
                if not ret:
                    print("Error: No se pudo capturar el fotograma, intentando de nuevo...")  # Depuración
                    await asyncio.sleep(0.1)  # Pausa antes de reintentar
                    continue

                print(f"Generando frame, is_streaming: {self.is_streaming}")  # Depuración
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                face_locations = face_recognition.face_locations(rgb_frame, model="hog")

                for (top, right, bottom, left) in face_locations:
                    cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)

                cv2.putText(frame, f"Faces: {len(face_locations)}", (10, 30),
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                cv2.putText(frame, "Presiona 'Capturar' en el dashboard para registrar", (10, frame.shape[0] - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

                self.current_frame = frame.copy()
                if self.capture_flag:
                    self.capture_flag = False
                    captured = frame.copy()
                    self.current_frame = captured  # Guardamos el frame para registrar

                ret, buffer = cv2.imencode('.jpg', frame)
                if not ret:
                    print("Error: No se pudo codificar el fotograma como JPG.")  # Depuración
                    await asyncio.sleep(0.1)
                    continue

                frame_bytes = buffer.tobytes()
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
                )
                await asyncio.sleep(0.1)  # Controlar la tasa de fotogramas de forma asíncrona
        except Exception as e:
            print(f"Excepción en gen_stream: {e}")  # Depuración
            raise
        finally:
            print("Cerrando gen_stream...")  # Depuración
            if self.cap and self.cap.isOpened():
                self.cap.release()
            self.cap = None

    async def start_stream(self):
        print("Iniciando streaming, estableciendo is_streaming a True...")  # Depuración
        self.is_streaming = True
        return {"status": "Streaming started"}

    async def stop_stream(self):
        print("Deteniendo streaming, estableciendo is_streaming a False...")  # Depuración
        self.is_streaming = False
        if self.cap and self.cap.isOpened():
            self.cap.release()
            self.cap = None
        return {"status": "Streaming stopped"}

    async def capture_and_register_face(self, cod_usuario: str):
        self.capture_flag = True

        timeout = 10  # segundos máximo esperando frame
        waited = 0
        while self.capture_flag and self.current_frame is None:
            await asyncio.sleep(0.1)
            waited += 0.1
            if waited >= timeout:
                raise Exception("⏰ Timeout esperando captura de frame")

        if self.current_frame is None:
            raise Exception("No se capturó ningún frame")

        try:
            frame = self.current_frame
            image_name = f"{cod_usuario}_IMG{str(uuid.uuid4())}.jpeg"
            image_path = os.path.join(self.image_dir, image_name)
            cv2.imwrite(image_path, frame)
            print(f"💾 Imagen guardada en: {image_path}")

            with open(image_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('ascii')

            payload = {
                "codUsuario": cod_usuario,
                "nombrePrivadoImagen": image_name,
                "base64Imagen": base64_image
            }

            print("📤 Enviando imagen al servidor NestJS...")
            response = requests.post(
                f"{self.nest_api_url}/privado/fotografias/registrar",
                json=payload,
                headers=self.get_auth_headers(),
                timeout=10
            )
            response.raise_for_status()

            print(f"✅ Rostro registrado correctamente: {response.json()}")
            return {"status": "✅ Rostro registrado", "image_name": image_name}

        except Exception as e:
            print(f"❌ Error en captura y registro: {e}")
            raise
        finally:
            self.current_frame = None