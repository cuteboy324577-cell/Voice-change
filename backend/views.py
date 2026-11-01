"""
TamilDub AI - Django REST Framework ViewSets and API Endpoints
"""

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import DubbingJob, Speaker, Transcript, User, Payment
from .tasks import run_tamildub_pipeline


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """POST /api/auth/register/"""
    email = request.data.get('email')
    username = request.data.get('username')
    password = request.data.get('password')
    if not email or not password:
        return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(email=email, username=username or email.split('@')[0], password=password)
    return Response({'id': str(user.id), 'email': user.email, 'credits': user.credits_remaining_minutes}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_dubbing(request):
    """POST /api/dubbing/start/"""
    user = request.user
    video_url = request.data.get('video_url')
    source_language = request.data.get('source_language', 'auto')
    is_cloning_enabled = request.data.get('is_cloning_enabled', False)
    consent_verified = request.data.get('consent_verified', False)

    job = DubbingJob.objects.create(
        user=user,
        title=request.data.get('title', 'Video Dubbing Project'),
        original_video_url=video_url,
        source_language=source_language,
        target_language='ta',
        status='queued',
        is_cloning_enabled=is_cloning_enabled,
        consent_verified=consent_verified
    )

    # Dispatch asynchronous Celery task
    task = run_tamildub_pipeline.delay(str(job.id), video_url, source_language, is_cloning_enabled)

    return Response({
        'job_id': str(job.id),
        'task_id': task.id,
        'status': 'queued',
        'message': '17-step dubbing pipeline initiated on Celery worker queue.'
    }, status=status.HTTP_202_ACCEPTED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_job_status(request, job_id):
    """GET /api/dubbing/status/<id>/"""
    try:
        job = DubbingJob.objects.get(id=job_id, user=request.user)
        return Response({
            'id': str(job.id),
            'status': job.status,
            'progress': job.progress,
            'current_step': job.current_step,
            'quality_score': job.quality_score,
            'output_video_url': job.output_video_url,
            'subtitles_srt': job.subtitles_srt
        })
    except DubbingJob.DoesNotExist:
        return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)
