# ==============================================================================
# Makefile for Django Docker Project
#
# Commands:
#   make (dev)      : Start development environment (default)
#   make stop       : Stop development environment
#   make logs       : View development logs
#   make manage     : Run a manage.py command in dev (e.g., make manage cmd="migrate")
#   make shell      : Open a shell in the dev web container
#
#   make prod-up    : Start production environment (detached)
#   make prod-down  : Stop production environment
#   make prod-logs  : View production logs
#   make prod-manage: Run a manage.py command in prod (e.g., make prod-manage cmd="createsuperuser")
#   make prod-shell : Open a shell in the prod web container
#
#   make clean      : Remove all stopped containers, networks, and dangling images
# ==============================================================================

# --- ตัวแปร ---

# ชื่อไฟล์ docker-compose สำหรับ Production
PROD_COMPOSE_FILE = docker-compose.yml
# ไฟล์ docker-compose สำหรับ Development (ซึ่งจะ override PROD_COMPOSE_FILE)
DEV_COMPOSE_FILES = -f $(PROD_COMPOSE_FILE) -f docker-compose.override.yml

# ชื่อ Service ของเว็บ (ตั้งไว้ใน docker-compose.yml)
SERVICE_WEB = web

# --- Development Commands (Default) ---

.PHONY: dev
dev:
	@echo "Starting development environment..."
	docker-compose $(DEV_COMPOSE_FILES) up -d --build

.PHONY: stop
stop:
	@echo "Stopping development environment..."
	docker-compose $(DEV_COMPOSE_FILES) down

.PHONY: logs
logs:
	@echo "Following development logs..."
	docker-compose $(DEV_COMPOSE_FILES) logs -f $(SERVICE_WEB)

# ตัวแปร cmd สำหรับรับคำสั่ง manage.py
cmd = ""
.PHONY: manage
manage:
	@echo "Running manage.py command in dev: $(cmd)"
	docker-compose $(DEV_COMPOSE_FILES) exec $(SERVICE_WEB) python manage.py $(cmd)

.PHONY: shell
shell:
	@echo "Opening shell in dev web container..."
	docker-compose $(DEV_COMPOSE_FILES) exec $(SERVICE_WEB) /bin/bash

# --- Production Commands ---

.PHONY: prod-up
prod-up:
	@echo "Starting production environment in detached mode..."
	docker-compose -f $(PROD_COMPOSE_FILE) up -d --build

.PHONY: prod-down
prod-down:
	@echo "Stopping production environment..."
	docker-compose -f $(PROD_COMPOSE_FILE) down

.PHONY: prod-logs
prod-logs:
	@echo "Following production logs..."
	docker-compose -f $(PROD_COMPOSE_FILE) logs -f $(SERVICE_WEB)

.PHONY: prod-manage
prod-manage:
	@echo "Running manage.py command in prod: $(cmd)"
	docker-compose -f $(PROD_COMPOSE_FILE) exec $(SERVICE_WEB) python manage.py $(cmd)

.PHONY: prod-shell
prod-shell:
	@echo "Opening shell in prod web container..."
	docker-compose -f $(PROD_COMPOSE_FILE) exec $(SERVICE_WEB) /bin/bash

# --- Utility Commands ---

.PHONY: clean
clean:
	@echo "Cleaning up Docker system..."
	docker-compose $(DEV_COMPOSE_FILES) down -v --remove-orphans
	docker-compose -f $(PROD_COMPOSE_FILE) down -v --remove-orphans
	docker system prune -f
	docker volume prune -f

.PHONY: help
help:
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:' $(MAKEFILE_LIST) | sed 's/://' | awk '{printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
