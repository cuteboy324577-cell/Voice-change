"""
TamilDub AI - Database Models (MySQL / Django ORM)
Architecture for video dubbing, speaker diarization, transcripts, and consent verification.
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
import uuid


class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is mandatory')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    credits_remaining_minutes = models.IntegerField(default=60)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'


class DubbingJob(models.Model):
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dubbing_jobs')
    title = models.CharField(max_length=255)
    original_video_url = models.URLField(max_length=1000)
    source_language = models.CharField(max_length=10, default='auto')
    target_language = models.CharField(max_length=10, default='ta')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    progress = models.IntegerField(default=0)
    current_step = models.IntegerField(default=0)
    output_video_url = models.URLField(max_length=1000, null=True, blank=True)
    output_audio_url = models.URLField(max_length=1000, null=True, blank=True)
    subtitles_srt = models.TextField(null=True, blank=True)
    subtitles_vtt = models.TextField(null=True, blank=True)
    quality_score = models.IntegerField(default=95)
    is_cloning_enabled = models.BooleanField(default=False)
    consent_verified = models.BooleanField(default=False)
    duration_seconds = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'dubbing_jobs'
        ordering = ['-created_at']


class Speaker(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(DubbingJob, on_delete=models.CASCADE, related_name='speakers')
    speaker_name = models.CharField(max_length=120)
    gender = models.CharField(max_length=20, default='neutral')
    tamil_voice_name = models.CharField(max_length=100, default='Karthik')
    consent_status = models.BooleanField(default=False)
    voice_profile_reference = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'speakers'


class Transcript(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(DubbingJob, on_delete=models.CASCADE, related_name='transcripts')
    speaker = models.ForeignKey(Speaker, on_delete=models.SET_NULL, null=True, related_name='transcripts')
    original_text = models.TextField()
    tamil_text = models.TextField()
    romanized_tamil = models.TextField(null=True, blank=True)
    start_time = models.FloatField()  # seconds
    end_time = models.FloatField()    # seconds
    emotion_tone = models.CharField(max_length=50, default='neutral')
    confidence_score = models.FloatField(default=0.98)

    class Meta:
        db_table = 'transcripts'
        ordering = ['start_time']


class Payment(models.Model):
    PLAN_CHOICES = [
        ('creator', 'Creator'),
        ('pro', 'Pro Studio'),
        ('enterprise', 'Enterprise'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    plan = models.CharField(max_length=50, choices=PLAN_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    payment_status = models.CharField(max_length=50, default='completed')
    transaction_id = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'
