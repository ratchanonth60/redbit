# Redbit

Redbit is a modern, full-stack Reddit clone built with **Django (Backend)** and **React Native / Expo (Frontend)**. It features a responsive Reddit-like UI, real-time notifications, community management, and more.

## Tech Stack

- **Backend:** Python, Django, Graphene (GraphQL), PostgreSQL, Redis, Celery, Docker.
- **Frontend:** TypeScript, React Native, Expo, Apollo Client, NativeWind (Tailwind CSS).

## Prerequisites

Ensure you have the following installed:
- **Docker** & **Docker Compose** (for backend services)
- **Node.js** (v18+) & **npm** (for frontend)
- **Make** (for running commands)

## Quick Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ratchanonth60/redbit.git
    cd redbit
    ```

2.  **Setup the project (First time only):**
    This command creates `.env` files, installs dependencies, starts the backend, and runs database migrations.
    ```bash
    make setup
    ```

3.  **Start the application:**
    This starts both the Backend (Docker) and Frontend (Web).
    ```bash
    make dev
    ```
    - **Backend API:** http://localhost:8000/graphql/
    - **Frontend:** http://localhost:8081

## Common Commands

| Command | Description |
| :--- | :--- |
| `make dev` | Start full stack app (Backend + Web) |
| `make stop` | Stop all services |
| `make ios` | Start frontend on iOS Simulator |
| `make android` | Start frontend on Android Emulator |
| `make logs` | View backend logs |
| `make shell` | Open Django shell in container |
| `make migrate` | Run database migrations |
| `make superuser` | Create a Django superuser |
| `make clean` | Clean build artifacts and cache |

## 📂 Project Structure

```
redbit/
├── backend/                # Django Project
│   ├── redbit/             # Core settings & apps
│   │   ├── apps/           # Django Apps (posts, users, communities, etc.)
│   │   └── graphql_api/    # GraphQL Schema & Resolvers
│   ├── Dockerfile          # Backend Dockerfile
│   └── pyproject.toml      # Python dependencies
│
├── frontend/               # Expo / React Native Project
│   ├── app/                # Expo Router (File-based routing)
│   ├── components/         # Reusable UI Components
│   ├── constants/          # Theme & Colors
│   └── global.css          # Tailwind CSS imports
│
├── docker-compose.yml      # Docker services config
└── Makefile                # Command shortcuts
```

## 📝 Notes

- **Android Emulator:** If running on Android, the API URL is automatically set to `10.0.2.2:8000`.
- **Web:** CORS is configured to allow requests from the frontend.
- **Admin Panel:** Access Django Admin at http://localhost:8000/admin/

---
*Built with ❤️ by Antigravity*
