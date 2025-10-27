from django.db import models


class TimestampedModel(models.Model):
    """
    Abstract Base Model ที่เพิ่ม created_at และ updated_at
    ให้กับทุก Model ที่สืบทอด (inherit) จากมัน
    """

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
