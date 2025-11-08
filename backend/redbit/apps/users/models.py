from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)
    
    # Profile Fields
    bio = models.TextField(blank=True, null=True, max_length=500)
    profile_picture = models.URLField(blank=True, null=True)  # เปลี่ยนเป็น URL
    banner_image = models.URLField(blank=True, null=True)
    
    # Karma System
    post_karma = models.IntegerField(default=0)
    comment_karma = models.IntegerField(default=0)
    
    # Follow System
    following = models.ManyToManyField(
        "self", 
        symmetrical=False, 
        related_name="followers", 
        blank=True
    )
    
    # Utility Fields
    email_verified = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)
    
    # Settings
    notifications_enabled = models.BooleanField(default=True)
    dark_mode = models.BooleanField(default=False)
    
    class Meta(AbstractUser.Meta):
        db_table = "user"

    def __str__(self):
        return self.username

    @property
    def total_karma(self):
        return self.post_karma + self.comment_karma

    @property
    def follower_count(self):
        return self.followers.count()

    @property
    def following_count(self):
        return self.following.count()
