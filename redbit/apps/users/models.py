from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # Field ที่เรามีอยู่แล้ว
    email = models.EmailField(unique=True)

    # --- 1. Profile Fields ---
    bio = models.TextField(blank=True, null=True, max_length=500)

    # อย่าลืมติดตั้ง Pillow และตั้งค่า MEDIA_ROOT
    profile_picture = models.ImageField(upload_to="avatars/", null=True, blank=True)
    banner_image = models.ImageField(upload_to="banners/", null=True, blank=True)

    # --- 2. Karma System ---
    post_karma = models.IntegerField(default=0)
    comment_karma = models.IntegerField(default=0)

    # --- 3. Follow System ---
    # symmetrical=False บอกว่า ถ้า A follow B, ไม่ได้แปลว่า B follow A
    following = models.ManyToManyField("self", symmetrical=False, related_name="followers", blank=True)

    # --- 4. Utility Fields ---
    email_verified = models.BooleanField(default=False)

    class Meta(AbstractUser.Meta):
        db_table = "user"  # ชื่อตารางตามที่เราตกลงกัน

    def __str__(self):
        return self.username

    # --- Methods (ตัวอย่าง) ---
    @property
    def total_karma(self):
        """
        Method เสมือน (property) สำหรับรวมคะแนน Karma ทั้งหมด
        """
        return self.post_karma + self.comment_karma

    def get_follower_count(self):
        return self.followers.count()

    def get_following_count(self):
        return self.following.count()
