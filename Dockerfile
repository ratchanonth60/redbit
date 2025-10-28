# ARG ที่รับเวอร์ชัน Python มาจาก docker-compose
ARG PYTHON_VERSION="3.13"

# ========================
# 1. Build Stage
# ========================
FROM ghcr.io/astral-sh/uv:python${PYTHON_VERSION}-bookworm-slim AS build

WORKDIR /app

# สร้าง Non-root user
RUN useradd --create-home --shell /bin/bash appuser
# USER appuser (ยังไม่สลับ)

# คัดลอกไฟล์จัดการ Dependency
COPY pyproject.toml uv.lock* ./

# มอบสิทธิ์ให้ appuser เป็นเจ้าของ /app ก่อน
RUN chown -R appuser:appuser /app

# (สลับเป็น appuser ก่อนติดตั้ง)
USER appuser

# ติดตั้ง Production Dependencies โดยใช้ uv sync
RUN --mount=type=cache,target=/home/appuser/.cache/uv,uid=1000,gid=1000 \
    uv sync --locked --no-install-project --no-dev

# คัดลอกโค้ดโปรเจกต์ทั้งหมด (ตอนนี้เราเป็น appuser แล้ว)
COPY . .

# ========================
# 2. Runtime Stage
# ========================
FROM python:${PYTHON_VERSION}-slim AS runtime

WORKDIR /app

# สร้าง Non-root user
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# คัดลอก Virtual Environment และโค้ดโปรเจกต์จาก Build Stage
COPY --from=build --chown=appuser:appuser /app/.venv /app/.venv
COPY --from=build --chown=appuser:appuser /app /app

# ตั้งค่า PATH
ENV PATH="/app/.venv/bin:$PATH"
# ตั้งค่า Environment Variables สำหรับ Production
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 

# เปลี่ยน Working Directory ไปยังรากของโปรเจกต์ Django
WORKDIR /app/redbit

# Expose port ที่ gunicorn จะรัน
EXPOSE 8000

# รัน Gunicorn
# "redbit.wsgi" อ้างอิงจากไฟล์ /app/redbit/redbit/wsgi.py
CMD ["gunicorn", "redbit.wsgi:application", "--bind", "0.0.0.0:8000"]


