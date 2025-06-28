# backend/myapp/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HabitViewSet, HabitEntryViewSet, TaskViewSet, JournalEntryViewSet, update_task_time  # Import the view function

router = DefaultRouter()
router.register(r'habits', HabitViewSet)
router.register(r'habit-entries', HabitEntryViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'journal-entries', JournalEntryViewSet)

urlpatterns = [
    path('', include(router.urls)),  # All API endpoints
    path('tasks/<int:pk>/update-time/', update_task_time, name='update-task-time'),
]
