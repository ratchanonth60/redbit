
import logging
import subprocess
from datetime import datetime

import boto3
from celery import shared_task
from django.conf import settings

logger = logging.getLogger(__name__)

@shared_task
def backup_database_to_s3():
    """
    Backup PostgreSQL database to S3
    Runs daily at 2 AM (ตั้งใน Celery Beat)
    
    S3 Structure:
    backups/
    ├── database/
    │   ├── 2025/
    │   │   ├── 01/
    │   │   │   ├── backup_2025-01-15_02-00.sql.gz
    │   │   │   └── backup_2025-01-16_02-00.sql.gz
    """
    try:
        # Generate filename
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        date_path = datetime.now().strftime('%Y/%m')
        filename = f"backup_{timestamp}.sql.gz"
        local_path = f"/tmp/{filename}"
        s3_key = f"backups/database/{date_path}/{filename}"
        
        # Create PostgreSQL dump
        dump_cmd = [
            'pg_dump',
            '-h', settings.DATABASES['default']['HOST'],
            '-U', settings.DATABASES['default']['USER'],
            '-d', settings.DATABASES['default']['NAME'],
            '-F', 'c',  # Custom format (compressed)
            '-f', local_path
        ]
        
        subprocess.run(dump_cmd, check=True, env={
            'PGPASSWORD': settings.DATABASES['default']['PASSWORD']
        })
        
        # Upload to S3
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        s3_client.upload_file(
            local_path,
            settings.AWS_STORAGE_BUCKET_NAME,
            s3_key,
            ExtraArgs={
                'StorageClass': 'GLACIER_IR',  # Cheaper storage for backups
            }
        )
        
        # Clean up local file
        import os
        os.remove(local_path)
        
        logger.info(f"Database backup successful: {s3_key}")
        
        # Delete old backups (keep last 30 days)
        delete_old_backups(s3_client, days=30)
        
        return {"success": True, "backup": s3_key}
        
    except Exception as e:
        logger.error(f"Backup failed: {str(e)}")
        return {"success": False, "error": str(e)}


def delete_old_backups(s3_client, days=30):
    """Delete backups older than X days"""
    from datetime import timedelta
    
    cutoff_date = datetime.now() - timedelta(days=days)
    
    response = s3_client.list_objects_v2(
        Bucket=settings.AWS_STORAGE_BUCKET_NAME,
        Prefix='backups/database/'
    )
    
    for obj in response.get('Contents', []):
        if obj['LastModified'].replace(tzinfo=None) < cutoff_date:
            s3_client.delete_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=obj['Key']
            )
            logger.info(f"Deleted old backup: {obj['Key']}")
