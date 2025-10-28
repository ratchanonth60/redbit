# ==============================================================================
# Makefile for Django Docker Project
#
# Commands:
#   make (dev) [SERVICES="web worker"] : Start specified dev services (default: all)
#   make stop                         : Stop development environment
#   make logs [SERVICE=web]           : View logs for a specific dev service (default: web)
#   make manage cmd="..."             : Run manage.py in dev web container
#   make shell [SERVICE=web]          : Open shell in a specific dev container (default: web)
#
#   make prod-up [SERVICES="web worker"]: Start specified prod services (default: all)
#   make prod-down                    : Stop production environment
#   make prod-logs [SERVICE=web]      : View logs for a specific prod service (default: web)
#   make prod-manage cmd="..."        : Run manage.py in prod web container
#   make prod-shell [SERVICE=web]     : Open shell in a specific prod container (default: web)
#
#   make clean                        : Remove containers, networks, volumes
#   make help                         : Show this help message
# ==============================================================================

# --- ตัวแปร ---
PROD_COMPOSE_FILE = docker-compose.yml
DEV_COMPOSE_FILES = -f $(PROD_COMPOSE_FILE) -f docker-compose.override.yml

# ชื่อ Service เริ่มต้น (ถ้าไม่ได้ระบุ)
DEFAULT_SERVICE_WEB = web
SERVICE ?= $(DEFAULT_SERVICE_WEB) # ใช้ตัวแปร SERVICE หรือ default เป็น web

# รายการ Services ที่จะ start (ถ้าไม่ได้ระบุ จะ start ทั้งหมด)
SERVICES ?=

# --- Development Commands ---

.PHONY: dev
dev:
	@echo "Starting development services: $(or $(SERVICES),all)..."
	docker-compose $(DEV_COMPOSE_FILES) up -d --build $(SERVICES)

.PHONY: stop
stop:
	@echo "Stopping development environment..."
	docker-compose $(DEV_COMPOSE_FILES) down

.PHONY: logs
logs:
	@echo "Following development logs for service: $(SERVICE)..."
	docker-compose $(DEV_COMPOSE_FILES) logs -f $(SERVICE)

cmd = ""
.PHONY: manage
manage:
	@echo "Running manage.py command in dev web container: $(cmd)"
	docker-compose $(DEV_COMPOSE_FILES) exec $(DEFAULT_SERVICE_WEB) python manage.py $(cmd)

.PHONY: shell
shell:
	@echo "Opening shell in dev container: $(SERVICE)..."
	docker-compose $(DEV_COMPOSE_FILES) exec $(SERVICE) /bin/bash

# --- Production Commands ---

.PHONY: prod-up
prod-up:
	@echo "Starting production services: $(or $(SERVICES),all)..."
	docker-compose -f $(PROD_COMPOSE_FILE) up -d --build $(SERVICES)

.PHONY: prod-down
prod-down:
	@echo "Stopping production environment..."
	docker-compose -f $(PROD_COMPOSE_FILE) down

.PHONY: prod-logs
prod-logs:
	@echo "Following production logs for service: $(SERVICE)..."
	docker-compose -f $(PROD_COMPOSE_FILE) logs -f $(SERVICE)

.PHONY: prod-manage
prod-manage:
	@echo "Running manage.py command in prod web container: $(cmd)"
	docker-compose -f $(PROD_COMPOSE_FILE) exec $(DEFAULT_SERVICE_WEB) python manage.py $(cmd)

.PHONY: prod-shell
prod-shell:
	@echo "Opening shell in prod container: $(SERVICE)..."
	docker-compose -f $(PROD_COMPOSE_FILE) exec $(SERVICE) /bin/bash

# --- Utility Commands ---

.PHONY: clean
clean:
	@echo "Cleaning up Docker system (containers, networks, volumes)..."
	docker-compose $(DEV_COMPOSE_FILES) down -v --remove-orphans
	docker-compose -f $(PROD_COMPOSE_FILE) down -v --remove-orphans
	# docker system prune -af # (Optional: ลบ image ที่ไม่ใช้ด้วย อาจจะแรงไป)
	docker volume prune -f

.PHONY: help
help:
	@echo "Available commands:"
	@grep -E '^#   make .*:' $(MAKEFILE_LIST) | sed 's/#   make //' | awk -F ':' '{printf "  \033[36m%-30s\033[0m %s\n", $$1, $$2}'
