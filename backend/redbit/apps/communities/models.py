from core.models import TimestampedModel
from django.conf import settings
from django.db import models


class Community(TimestampedModel):
    name = models.CharField(max_length=100, unique=True, db_index=True)
    slug = models.SlugField(max_length=120, unique=True, db_index=True)
    description = models.TextField(blank=True)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name="owned_communities", null=True, blank=True
    )
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="joined_communities", blank=True)

    # ไม่ต้องมี created_at, updated_at แล้ว เพราะอยู่ใน TimestampedModel

    class Meta(TimestampedModel.Meta):
        db_table = "community"
        verbose_name_plural = "communities"  # แก้ชื่อในหน้า Admin ให้ถูกต้อง

    def __str__(self):
        return self.name


