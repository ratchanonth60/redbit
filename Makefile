# ==============================================================================
# Makefile for Redbit Full Stack Project
#
# Commands:
#   Development:
#     make dev              : Start both backend and frontend in dev mode
#     make dev-backend      : Start backend only
#     make dev-frontend     : Start frontend only
#     make stop             : Stop all services
#
#   Backend Specific:
#     make backend-logs     : View backend logs
#     make backend-shell    : Open shell in backend container
#     make backend-manage   : Run Django management command (cmd="...")
#     make migrate          : Run Django migrations
#     make makemigrations   : Create new migrations
#     make superuser        : Create Django superuser
#
#   Frontend Specific:
#     make frontend-install : Install frontend dependencies
#     make frontend-clean   : Clean frontend cache/node_modules
#     make ios              : Start iOS simulator
#     make android          : Start Android emulator
#
#   Database:
#     make db-shell         : Open PostgreSQL shell
#     make db-backup        : Backup database
#     make db-restore       : Restore database
#
#   Production:
#     make prod-up          : Start production services
#     make prod-down        : Stop production services
#     make prod-logs        : View production logs
#
#   Utility:
#     make clean            : Clean all containers, volumes, and caches
#     make logs             : View all logs
#     make ps               : Show running containers
#     make help             : Show this help message
# ==============================================================================

# --- Variables ---
BACKEND_DIR = backend
FRONTEND_DIR = frontend
DOCKER_COMPOSE = docker-compose -f docker-compose.yml -f docker-compose.override.yml
DOCKER_COMPOSE_PROD = docker-compose -f docker-compose.yml

# Colors for output
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No Color

# --- Main Commands ---

.PHONY: help
help:
	@printf "$(GREEN)Redbit Full Stack Commands:$(NC)\n"
	@printf "\n"
	@printf "$(YELLOW)Development:$(NC)\n"
	@printf "  make dev              - Start both backend and frontend\n"
	@printf "  make dev-backend      - Start backend only\n"
	@printf "  make dev-frontend     - Start frontend only\n"
	@printf "  make stop             - Stop all services\n"
	@printf "\n"
	@printf "$(YELLOW)Backend:$(NC)\n"
	@printf "  make backend-logs     - View backend logs\n"
	@printf "  make backend-shell    - Open shell in backend\n"
	@printf "  make backend-manage   - Run Django command (cmd=\"...\")\n"
	@printf "  make migrate          - Run migrations\n"
	@printf "  make makemigrations   - Create migrations\n"
	@printf "  make superuser        - Create superuser\n"
	@printf "\n"
	@printf "$(YELLOW)Frontend:$(NC)\n"
	@printf "  make frontend-install - Install dependencies\n"
	@printf "  make frontend-clean   - Clean cache\n"
	@printf "  make ios              - Start iOS simulator\n"
	@printf "  make android          - Start Android\n"
	@printf "\n"
	@printf "$(YELLOW)Database:$(NC)\n"
	@printf "  make db-shell         - PostgreSQL shell\n"
	@printf "  make db-backup        - Backup database\n"
	@printf "  make db-restore       - Restore database\n"
	@printf "\n"
	@printf "$(YELLOW)Production:$(NC)\n"
	@printf "  make prod-up          - Start production\n"
	@printf "  make prod-down        - Stop production\n"
	@printf "\n"
	@printf "$(YELLOW)Utility:$(NC)\n"
	@printf "  make clean            - Clean everything\n"
	@printf "  make logs             - View all logs\n"
	@printf "  make ps               - Show containers\n"

# --- Development Commands ---

.PHONY: dev
dev:
	@printf "$(GREEN)🚀 Starting Full Stack Development Environment...$(NC)\n"
	@$(MAKE) dev-backend
	@sleep 5
	@$(MAKE) dev-frontend

.PHONY: dev-backend
dev-backend:
	@printf "$(GREEN)🐍 Starting Backend (Django + PostgreSQL + Redis + Celery)...$(NC)\n"
	cd $(BACKEND_DIR) && $(DOCKER_COMPOSE) up -d --build

.PHONY: dev-frontend
dev-frontend:
	@printf "$(GREEN)📱 Starting Frontend (Expo)...$(NC)\n"
	@if [ ! -d "$(FRONTEND_DIR)/node_modules" ]; then \
		printf "$(YELLOW)Installing frontend dependencies...$(NC)\n"; \
		cd $(FRONTEND_DIR) && npm install || exit 1; \
	fi
	@cd $(FRONTEND_DIR) && npm start

.PHONY: ios
ios:
	@printf "$(GREEN)🍎 Starting iOS simulator...$(NC)\n"
	cd $(FRONTEND_DIR) && npm run ios

.PHONY: android
android:
	@printf "$(GREEN)🤖 Starting Android emulator...$(NC)\n"
	cd $(FRONTEND_DIR) && npm run android

.PHONY: web
web:
	@printf "$(GREEN)🌐 Starting web version...$(NC)\n"
	cd $(FRONTEND_DIR) && npm run web

# --- Testing Commands ---

.PHONY: test-backend
test-backend:
	@printf "$(GREEN)🧪 Running backend tests...$(NC)\n"
	cd $(BACKEND_DIR) && $(DOCKER_COMPOSE) exec web python manage.py test

.PHONY: lint-backend
lint-backend:
	@printf "$(GREEN)🔍 Linting backend...$(NC)\n"
	cd $(BACKEND_DIR) && $(DOCKER_COMPOSE) exec web ruff check .

.PHONY: lint-frontend
lint-frontend:
	@printf "$(GREEN)🔍 Linting frontend...$(NC)\n"
	cd $(FRONTEND_DIR) && npm run lint

.PHONY: format-backend
format-backend:
	@printf "$(GREEN)✨ Formatting backend code...$(NC)\n"
	cd $(BACKEND_DIR) && $(DOCKER_COMPOSE) exec web black .

# --- Setup Commands ---

.PHONY: setup
setup:
	@printf "$(GREEN)🎯 Setting up project for the first time...$(NC)\n"
	@printf "$(YELLOW)1. Creating .env files...$(NC)\n"
	@if [ ! -f "$(BACKEND_DIR)/.env" ]; then \
		cp $(BACKEND_DIR)/env.example $(BACKEND_DIR)/.env; \
		printf "$(GREEN)✅ Backend .env created$(NC)\n"; \
	fi
	@printf "$(YELLOW)2. Installing frontend dependencies...$(NC)\n"
	$(MAKE) frontend-install
	@printf "$(YELLOW)3. Starting backend...$(NC)\n"
	$(MAKE) dev-backend
	@sleep 10
	@printf "$(YELLOW)4. Running migrations...$(NC)\n"
	$(MAKE) migrate
	@printf "$(GREEN)✅ Setup complete! Run 'make dev' to start development$(NC)\n"

# --- Info Commands ---

.PHONY: status
status:
	@printf "$(GREEN)📊 Project Status:$(NC)\n"
	@printf "\n"
	@printf "$(YELLOW)Backend Services:$(NC)\n"
	@cd $(BACKEND_DIR) && $(DOCKER_COMPOSE) ps
	@printf "\n"
	@printf "$(YELLOW)Frontend:$(NC)\n"
	@if [ -d "$(FRONTEND_DIR)/node_modules" ]; then \
		printf "$(GREEN)✅ Dependencies installed$(NC)\n"; \
	else \
		printf "$(RED)❌ Dependencies not installed$(NC)\n"; \
	fi

.PHONY: urls
urls:
	@printf "$(GREEN)🔗 Service URLs:$(NC)\n"
	@printf "\n"
	@printf "Backend API:        http://localhost:8000\n"
	@printf "GraphQL Playground: http://localhost:8000/graphql/\n"
	@printf "Django Admin:       http://localhost:8000/admin/\n"
	@printf "PostgreSQL:         localhost:5432\n"
	@printf "Redis:              localhost:6379\n"
	@printf "\n"
	@printf "Frontend:           http://localhost:8081\n"
	@printf "Expo Dev Tools:     http://localhost:19006\n"

.DEFAULT_GOAL := help
