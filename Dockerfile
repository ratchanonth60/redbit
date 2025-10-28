# ========================
# Build Arguments
# ========================
ARG PYTHON_VERSION="3.13"

# ========================
# Build Stage
# ========================
FROM ghcr.io/astral-sh/uv:python${PYTHON_VERSION}-bookworm-slim AS build

WORKDIR /app

# Copy only dependency files first for caching
COPY pyproject.toml uv.lock* ./

# Install dependencies (no project yet)
RUN uv sync --locked --no-install-project --no-dev

# Copy source code
COPY . .

# ========================
# Runtime Stage
# ========================
FROM python:${PYTHON_VERSION}-slim AS runtime

# Install required system packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    passwd \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install uv in runtime
RUN pip install --no-cache-dir uv

# Copy entrypoint
COPY ./docker/entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Copy lockfiles
COPY --from=build /app/pyproject.toml /app/uv.lock* ./

# Create non-root user (fixed)
RUN useradd -m -u 1000 appuser

# Change ownership before switching user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Set env for uv virtualenv
ENV UV_PROJECT_ENVIRONMENT=/app/.venv

# Install dependencies inside .venv
RUN uv sync --locked --no-install-project --no-dev --python $(which python)

# Copy project source (with ownership preserved)
COPY --from=build --chown=appuser:appuser /app ./

# Setup environment
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app/redbit
EXPOSE 8000

# Entrypoint & default command
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["/app/.venv/bin/gunicorn", "redbit.wsgi:application", "--bind", "0.0.0.0:8000"]

