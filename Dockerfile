ARG PYTHON_VERSION="3.13"

# ========================
# Build Stage
# ========================
FROM ghcr.io/astral-sh/uv:python${PYTHON_VERSION}-bookworm-slim AS build

WORKDIR /app

# Copy only lockfiles/deps first for cache
COPY pyproject.toml uv.lock* ./

# Install dependencies only (no project) – ตามแนวทาง uv
RUN uv sync --locked --no-install-project --no-dev

# Copy project source
COPY . .

# ========================
# Runtime Stage
# ========================
FROM python:${PYTHON_VERSION}-slim AS runtime

WORKDIR /app

# Install uv into runtime image
RUN pip install --no-cache-dir uv

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser

# Copy lockfiles
COPY --from=build /app/pyproject.toml /app/uv.lock* ./

# Grant ownership so appuser can write to /app
RUN chown -R appuser:appuser /app

USER appuser

# Set environment variable for uv so it uses /app/.venv
ENV UV_PROJECT_ENVIRONMENT=/app/.venv

# Run uv sync to install production dependencies into /app/.venv
RUN uv sync --locked --no-install-project --no-dev --python $(which python)

# Copy project source with correct ownership
COPY --from=build --chown=appuser:appuser /app ./

# Set PATH to use venv
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app/redbit
EXPOSE 8000

# Check that Django is installed
RUN uv pip show django || (echo "Django not installed!" && exit 1)

CMD ["/app/.venv/bin/gunicorn", "redbit.wsgi:application", "--bind", "0.0.0.0:8000"]

