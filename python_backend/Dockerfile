FROM python:3.11-slim-bullseye

# Evitar prompts durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependencias del sistema necesarias para face_recognition y otras
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    libboost-python-dev \
    libboost-system-dev \
    libboost-thread-dev \
    libssl-dev \
    libffi-dev \
    python3-dev \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar e instalar dependencias Python
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del proyecto
COPY . .

# Exponer el puerto de FastAPI
EXPOSE 5000

# Usar Uvicorn para correr FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
