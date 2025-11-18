import uuid
from io import BytesIO

import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from PIL import Image


class S3Storage:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        self.bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        self.cdn_url = settings.AWS_S3_CUSTOM_DOMAIN
    
    def upload_image(self, file, folder, optimize=True):
        """
        Upload and optimize image to S3
        
        S3 Structure:
        ├── posts/
        │   ├── 2025/01/uuid.jpg
        ├── avatars/
        │   ├── user_123.jpg
        ├── banners/
        │   ├── community_abc.jpg
        └── temp/
            └── upload_xyz.jpg
        """
        try:
            # Generate unique filename
            ext = file.name.split('.')[-1]
            filename = f"{uuid.uuid4()}.{ext}"
            
            # Add date-based path for posts
            from datetime import datetime
            date_path = datetime.now().strftime('%Y/%m')
            key = f"{folder}/{date_path}/{filename}" if folder == "posts" else f"{folder}/{filename}"
            
            # Optimize image
            if optimize and ext.lower() in ['jpg', 'jpeg', 'png']:
                file = self._optimize_image(file)
            
            # Upload to S3
            self.s3_client.upload_fileobj(
                file,
                self.bucket_name,
                key,
                ExtraArgs={
                    'ContentType': file.content_type,
                    'ACL': 'public-read',  # หรือใช้ CloudFront signed URLs
                    'CacheControl': 'max-age=31536000',  # 1 year cache
                }
            )
            
            # Return CDN URL
            return f"https://{self.cdn_url}/{key}"
            
        except ClientError as e:
            raise Exception(f"S3 Upload failed: {str(e)}")
    
    def _optimize_image(self, file, max_size=(1920, 1920), quality=85):
        """Optimize image before upload"""
        img = Image.open(file)
        
        # Convert RGBA to RGB if needed
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        
        # Resize if too large
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save to bytes
        output = BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)
        output.seek(0)
        
        return output
    
    def delete_file(self, url):
        """Delete file from S3"""
        try:
            # Extract key from URL
            key = url.replace(f"https://{self.cdn_url}/", "")
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except ClientError:
            return False
