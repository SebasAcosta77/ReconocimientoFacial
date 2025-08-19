# src/services/face_recognition_service.py
import dlib
import face_recognition
import numpy as np
import cv2
import requests
from datetime import datetime
import threading
import asyncio
import time
import os
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configurar CORS para permitir solicitudes desde tu frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Ajusta según la URL de tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FaceRecognitionService:
    def __init__(self):
        self.predictor_path = "C:/desarrollo/back_comptervision/python_backend/data/models/shape_predictor_68_face_landmarks.dat"
        self.face_detector = dlib.get_frontal_face_detector()
        self.shape_predictor = dlib.shape_predictor(self.predictor_path)
        self.known_face_encodings = []
        self.known_face_ids = []
        self.camera_index = 0
        self.nest_api_url = "http://localhost:3550"
        self.jwt_token = ""
        self.is_running = False
        self.frame_count = 0
        self.recognition_thread = None
        self.tracked_faces = []
        self.already_registered = set()
        self.current_frame = None  # Almacena el último fotograma para streaming

    def set_token(self, token: str):
        self.jwt_token = token

    def get_auth_headers(self):
        return {"Authorization": f"Bearer {self.jwt_token}"} if self.jwt_token else {}

    def process_image(self, img):
        ruta = img.get("rutaImagen")
        cod_usuario = img.get("codUsuario")
        if not ruta or not cod_usuario:
            print(f"Omitiendo imagen: Falta rutaImagen o codUsuario - {img}")
            return None
        if not os.path.exists(ruta):
            print(f"Omitiendo imagen: Archivo no encontrado - {ruta}")
            return None
        try:
            print(f"Comenzando a procesar imagen: {ruta}")
            image = face_recognition.load_image_file(ruta)
            encodings = face_recognition.face_encodings(image)
            if encodings:
                return (encodings[0], cod_usuario)
            else:
                print(f"No se encontraron rostros en la imagen: {ruta}")
                return None
        except Exception as e:
            print(f"Error al procesar la imagen {ruta}: {e}")
            return None

    async def load_known_faces(self):
        try:
            print("Obteniendo imágenes desde la API...")
            response = requests.get(
                f"{self.nest_api_url}/privado/fotografias/listar/todas",
                headers=self.get_auth_headers(),
                timeout=10
            )
            response.raise_for_status()
            images = response.json().get("data", [])
            self.known_face_encodings.clear()
            self.known_face_ids.clear()
            for img in images:
                result = self.process_image(img)
                if result:
                    self.known_face_encodings.append(result[0])
                    self.known_face_ids.append(result[1])
        except Exception as e:
            print(f"Error al cargar rostros conocidos: {e}")

    async def register_attendance(self, cod_usuario, cod_evento):
        try:
            payload = {
                "codUsuario": str(cod_usuario),
                "codEvento": int(cod_evento),
                "horaEntrada": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "estadoValidacion": True,
                "observacionesAsistencia": "Asistencia registrada por reconocimiento facial",
            }
            response = requests.post(
                f"{self.nest_api_url}/privado/registroasistencia/add",
                json=payload,
                headers=self.get_auth_headers(),
                timeout=10
            )
            response.raise_for_status()
            print(f"Asistencia registrada para: {cod_usuario}")
        except Exception as e:
            print(f"Error al registrar asistencia para {cod_usuario}: {e}")

    def gen_stream(self):
        """Generar flujo MJPEG desde el fotograma actual."""
        while self.is_running:
            if self.current_frame is not None:
                ret, buffer = cv2.imencode('.jpg', self.current_frame)
                frame = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            time.sleep(0.1)  # Controlar la tasa de fotogramas

    def recognition_loop(self, cod_evento):
        print("Inicializando cámara...")
        cap = cv2.VideoCapture(self.camera_index, cv2.CAP_DSHOW)
        if not cap.isOpened():
            print("Error: No se pudo abrir la cámara.")
            self.is_running = False
            return

        face_ttl = 150
        scale_factor = 2

        while self.is_running:
            ret, frame = cap.read()
            if not ret:
                print("Error: No se pudo capturar el fotograma.")
                break

            frame = cv2.flip(frame, 1)
            small_frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
            rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

            face_locations = []
            face_encodings = []
            if self.frame_count % 2 == 0:
                face_locations = face_recognition.face_locations(rgb_small_frame, model="hog")
                face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

            if not face_locations:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                face_locations = face_recognition.face_locations(rgb_frame, model="hog")
                face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
                scale_factor = 1
            else:
                scale_factor = 2

            new_tracked_faces = []
            for (top, right, bottom, left), encoding in zip(face_locations, face_encodings):
                matched = False
                for tracked in self.tracked_faces:
                    if face_recognition.compare_faces([tracked["encoding"]], encoding, tolerance=0.5)[0]:
                        tracked["location"] = (top, right, bottom, left)
                        tracked["ttl"] = face_ttl
                        new_tracked_faces.append(tracked)
                        matched = True
                        break

                if not matched:
                    matches = face_recognition.compare_faces(self.known_face_encodings, encoding, tolerance=0.5)
                    name = "No Reconocido"
                    if True in matches:
                        index = matches.index(True)
                        name = self.known_face_ids[index]
                        if name not in self.already_registered:
                            asyncio.run(self.register_attendance(name, cod_evento))
                            self.already_registered.add(name)

                    new_tracked_faces.append({
                        "encoding": encoding,
                        "location": (top, right, bottom, left),
                        "name": name,
                        "ttl": face_ttl
                    })

            self.tracked_faces = [face for face in new_tracked_faces if face["ttl"] > 0]
            for face in self.tracked_faces:
                face["ttl"] -= 1

            for face in self.tracked_faces:
                top, right, bottom, left = face["location"]
                name = face.get("name", "Desconocido")
                top *= scale_factor
                right *= scale_factor
                bottom *= scale_factor
                left *= scale_factor

                color = (0, 255, 0) if name != "No Reconocido" else (0, 0, 255)
                cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
                cv2.rectangle(frame, (left, bottom), (right, bottom + 30), color, cv2.FILLED)
                cv2.putText(frame, name, (left + 6, bottom + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 1)

            self.current_frame = frame  # Actualizar el fotograma actual para streaming
            self.frame_count += 1
            time.sleep(0.01)

        cap.release()
        self.is_running = False

    async def start_recognition(self, cod_evento):
        if self.is_running:
            return {"status": "Reconocimiento ya en ejecución"}
        self.is_running = True
        await self.load_known_faces()
        self.recognition_thread = threading.Thread(target=self.recognition_loop, args=(cod_evento,))
        self.recognition_thread.start()
        return {"status": "Reconocimiento iniciado"}

    def stop_recognition(self):
        self.is_running = False
        if self.recognition_thread:
            self.recognition_thread.join()
        return {"status": "Reconocimiento detenido"}