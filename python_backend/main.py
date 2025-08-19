from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import api

app = FastAPI()

# ✅ Agrega CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # O usa ["*"] si estás en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
app.include_router(api, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
