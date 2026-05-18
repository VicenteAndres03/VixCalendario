# 📅 API Calendario

Sistema de calendarización personal que permite organizar el día a día mediante horarios, tareas recurrentes y eventos únicos. Diseñado para múltiples usuarios con soporte de pagos integrado mediante Flow.cl.

---

## 🛠️ Tecnologías utilizadas

### Backend
![Java](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.2-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

### Pruebas
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

---

## 🗂️ Estructura del repositorio

```
apicalendario/
├── backend/                  # API REST con Spring Boot
│   ├── src/
│   │   └── main/
│   │       ├── java/com/apicalendario/
│   │       │   ├── config/
│   │       │   ├── controller/
│   │       │   ├── dto/
│   │       │   ├── exception/
│   │       │   ├── model/
│   │       │   ├── repository/
│   │       │   ├── security/
│   │       │   └── service/
│   │       └── resources/
│   │           └── application.properties
│   ├── .env                  # ⚠️ No subir a GitHub
│   └── pom.xml
├── frontend/                 # Interfaz con React + Vite
│   ├── src/
│   ├── .env                  # ⚠️ No subir a GitHub
│   └── package.json
└── README.md
```

---

## ⚙️ Variables de entorno

### Backend — archivo `backend/.env`

```env
# Base de datos
DB_URL=jdbc:postgresql://localhost:5432/apicalendario
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
DB_DDL_AUTO=update

# JWT
JWT_SECRET=tu_clave_secreta
JWT_EXPIRATION=86400000

# Correo Gmail
MAIL_USERNAME=tu_correo@gmail.com
MAIL_PASSWORD=tu_app_password

# Flow.cl pagos
FLOW_API_KEY=tu_api_key
FLOW_SECRET_KEY=tu_secret_key
```

### Frontend — archivo `frontend/.env`

```env
VITE_API_URL=http://localhost:8080
```

> ⚠️ **Nunca subas los archivos `.env` a GitHub.** Ya están incluidos en el `.gitignore`.

---

## 🚀 Cómo ejecutar el proyecto

### Requisitos previos

- Java 21
- Maven
- PostgreSQL
- Node.js 18+

---

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/apicalendario.git
cd apicalendario
```

---

### 2. Configura la base de datos

Abre el SQL Shell de PostgreSQL y ejecuta:

```sql
CREATE DATABASE apicalendario;
CREATE USER tu_usuario WITH PASSWORD 'tu_contraseña';
GRANT ALL PRIVILEGES ON DATABASE apicalendario TO tu_usuario;
```

---

### 3. Ejecuta el backend

```bash
cd backend
```

Crea el archivo `.env` con tus variables de entorno (ver sección anterior), luego ejecuta:

```bash
./mvnw spring-boot:run
```

El backend estará disponible en: `http://localhost:8080`

---

### 4. Ejecuta el frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

---

## 🧪 Pruebas

Las pruebas de los endpoints se realizan con **Postman**.

Importa la colección incluida en la carpeta `/postman` del proyecto *(próximamente)*.

---

## 💳 Pagos

El sistema de pagos está integrado con **Flow.cl**, plataforma de pagos chilena. Incluye:

- 1 mes de prueba gratuito por usuario
- Cobro automático al finalizar el período de prueba

---

## 📄 Licencia

Este proyecto está bajo uso privado. Todos los derechos reservados.
