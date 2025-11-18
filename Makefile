# ==============================================================================
# Redbit Project Makefile
# ==============================================================================

# --- Variables ---
BACKEND_DIR = backend
FRONTEND_DIR = frontend
DOCKER_COMPOSE = docker-compose -f docker-compose.yml -f docker-compose.override.yml

# Colors
GREEN = \033[0;32m
YELLOW = \033[0;33m
NC = \033[0m

.DEFAULT_GOAL := help

# --- Main Commands ---

.PHONY: help
help:
	@echo "$(GREEN)Redbit Commands:$(NC)"
	@echo "  $(YELLOW)make dev$(NC)        Start full stack app (Backend + Frontend)"
	@echo "  $(YELLOW)make stop$(NC)       Stop all services"
	@echo "  $(YELLOW)make setup$(NC)      First time setup (env, install, migrate)"
	@echo "  $(YELLOW)make migrate$(NC)    Run database migrations"
	@echo "  $(YELLOW)make clean$(NC)      Clean build artifacts and cache"
	@echo ""
	@echo "$(GREEN)Backend:$(NC)"
	@echo "  $(YELLOW)make backend$(NC)    Start backend only"
	@echo "  $(YELLOW)make shell$(NC)      Open backend shell"
	@echo "  $(YELLOW)make logs$(NC)       View backend logs"
	@echo ""
	@echo "$(GREEN)Frontend:$(NC)"
	@echo "  $(YELLOW)make web$(NC)        Start frontend (Web)"
	@echo "  $(YELLOW)make ios$(NC)        Start frontend (iOS Simulator)"
	@echo "  $(YELLOW)make android$(NC)    Start frontend (Android Emulator)"

.PHONY: dev
dev:
	@echo "$(GREEN)>> Starting Redbit...$(NC)"
	@$(MAKE) backend
	@echo "$(YELLOW)Waiting for backend...$(NC)"
	@sleep 5
	@$(MAKE) web

.PHONY: stop
stop:
	@echo "$(YELLOW)>> Stopping services...$(NC)"
	@cd $(BACKEND_DIR) && $(DOCKER_COMPOSE) down

.PHONY: setup
setup:
	@echo "$(GREEN)>> Setting up project...$(NC)"
	@if [ ! -f "$(BACKEND_DIR)/.env" ]; then \
		cp $(BACKEND_DIR)/env.example $(BACKEND_DIR)/.env; \
		echo "$(GREEN)[OK] Created backend .env$(NC)"; \
	fi
	@echo "$(YELLOW)Installing frontend dependencies...$(NC)"
	@cd $(FRONTEND_DIR) && npm install
	@echo "$(YELLOW)Starting backend and migrating...$(NC)"
	@$(MAKE) backend
	@sleep 10
	@$(MAKE) migrate
	@echo "$(GREEN)[OK] Setup complete! Run 'make dev' to start.$(NC)"

.PHONY: clean
clean:
	@echo "$(YELLOW)>> Cleaning up...$(NC)"
	@cd $(BACKEND_DIR) && $(DOCKER_COMPOSE) down -v
	@rm -rf $(FRONTEND_DIR)/node_modules
	@rm -rf $(FRONTEND_DIR)/.expo
	@echo "$(GREEN)[OK] Clean complete.$(NC)"

# --- Backend ---

.PHONY: backend
backend:
	@cd $(BACKEND_DIR) && $(DOCKER_COMPOSE) up -d --build

.PHONY: migrate
migrate:
	@cd $(BACKEND_DIR) && $(DOCKER_COMPOSE) exec web python manage.py migrate

.PHONY: makemigrations
makemigrations:
	@cd $(BACKEND_DIR) && $(DOCKER_COMPOSE) exec web python manage.py makemigrations

.PHONY: shell
shell:
	@cd $(BACKEND_DIR) && $(DOCKER_COMPOSE) exec web python manage.py shell

.PHONY: logs
logs:
	@cd $(BACKEND_DIR) && $(DOCKER_COMPOSE) logs -f

.PHONY: superuser
superuser:
	@cd $(BACKEND_DIR) && $(DOCKER_COMPOSE) exec web python manage.py createsuperuser

# --- Frontend ---

.PHONY: web
web:
	@echo "$(GREEN)>> Starting Web...$(NC)"
	@cd $(FRONTEND_DIR) && npm run web

.PHONY: ios
ios:
	@echo "$(GREEN)>> Starting iOS...$(NC)"
	@cd $(FRONTEND_DIR) && npm run ios

.PHONY: android
android:
	@echo "$(GREEN)>> Starting Android...$(NC)"
	@cd $(FRONTEND_DIR) && npm run android
