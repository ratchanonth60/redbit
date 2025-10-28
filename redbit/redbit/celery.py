import os

from celery import Celery

# ตั้งค่า default Django settings module สำหรับ 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "redbit.settings.local")  # หรือ base ตามที่คุณใช้

app = Celery("redbit")  # ชื่อโปรเจกต์

# ใช้ string ที่นี่หมายความว่า worker ไม่จำเป็นต้อง serialize
# the configuration object to child processes.
# - namespace='CELERY' หมายความว่า config keys ทั้งหมดสำหรับ celery ควรมี prefix 'CELERY_'
app.config_from_object("django.conf:settings", namespace="CELERY")

# โหลด task modules จากทุก registered Django app configs.
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
