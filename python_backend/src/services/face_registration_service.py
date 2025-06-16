import cv2
import face_recognition
import requests
import os
import uuid
import base64

class FaceRegistrationService:
    def __init__(self):
        self.camera_index = 0
        self.nest_api_url = "http://localhost:3550"
        self.image_dir = "C:/desarrollo/back_comptervision/src/doc/img/usuario"

    async def capture_and_register_face(self, cod_usuario: str):
        try:
            # Inicializa la cámara
            cap = cv2.VideoCapture(self.camera_index, cv2.CAP_DSHOW)
            if not cap.isOpened():
                raise Exception(f"Failed to open camera at index {self.camera_index}")
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            print("Camera opened for face capture")

            while True:
                ret, frame = cap.read()
                if not ret:
                    raise Exception("Failed to capture frame from camera")

                # Detecta rostros en el frame
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                face_locations = face_recognition.face_locations(rgb_frame, model="hog")
                
                # Dibuja rectángulos alrededor de los rostros
                for (top, right, bottom, left) in face_locations:
                    cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
                
                # Muestra el número de rostros detectados
                cv2.putText(frame, f"Faces: {len(face_locations)}", (10, 30), 
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                
                # Instrucciones
                cv2.putText(frame, "Presiona Enter para capturar, ESC para cancelar", (10, frame.shape[0] - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                
                cv2.imshow("Capture Face", frame)
                
                key = cv2.waitKey(1) & 0xFF
                if key == 13:  # Enter
                    if len(face_locations) != 1:
                        print(f"Error: Exactly one face must be detected (found {len(face_locations)})")
                        continue
                    break
                elif key == 27:  # ESC
                    raise Exception("Face capture cancelled by user")

            # Guarda la imagen localmente (opcional, para depuración)
            image_name = f"{cod_usuario}_IMG{str(uuid.uuid4())}.jpeg"
            image_path = os.path.join(self.image_dir, image_name)
            cv2.imwrite(image_path, frame)
            print(f"Image saved locally at: {image_path}")

            # Convierte la imagen a base64
            with open(image_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')

            # Cierra la cámara
            cap.release()
            cv2.destroyAllWindows()

            # Registra la imagen en NestJS
            payload = {
                "codUsuario": cod_usuario,
                "nombrePrivadoImagen": image_name,
                "base64Imagen": base64_image
            }
            print(f"Sending registration payload: {payload}")
            response = requests.post(f"{self.nest_api_url}/privado/fotografias/registrar", json=payload, timeout=10)
            response.raise_for_status()
            print(f"Face registered: {response.json()}")
            return {"status": "Face registered", "image_name": image_name}

        except Exception as e:
            print(f"Error in capture_and_register_face: {e}")
            if 'cap' in locals():
                cap.release()
            cv2.destroyAllWindows()
            raise