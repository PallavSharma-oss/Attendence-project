# Attendance Project (Dockerized)

This project is fully dockerized with three services:

- Frontend (React app)
- Backend (Node.js + Express API)
- MongoDB database

## Prerequisites

1. Install Docker Desktop (or Docker Engine + Docker Compose).

## Run With One Command

1. From the project root, run:

```bash
docker compose up --build
```

2. Open the app in your browser:

```text
http://localhost:3000
```

## Services

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- MongoDB: `localhost:27017`

Backend connects to MongoDB using:

```text
mongodb://mongo:27017/attendance
```

## Stop Containers

```bash
docker compose down
```

To also remove DB volume data:

```bash
docker compose down -v
```
