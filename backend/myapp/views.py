from rest_framework import viewsets
from .models import Habit, HabitEntry, Task, JournalEntry
from .serializers import HabitSerializer, HabitEntrySerializer, TaskSerializer, JournalEntrySerializer
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

class HabitViewSet(viewsets.ModelViewSet):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer

class HabitEntryViewSet(viewsets.ModelViewSet):
    queryset = HabitEntry.objects.all()
    serializer_class = HabitEntrySerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['date', 'completed']
    ordering_fields = ['date', 'time']

    def get_queryset(self):
        queryset = super().get_queryset()
        date = self.request.query_params.get('date', None)
        if date:
            queryset = queryset.filter(date=date)
        return queryset

class JournalEntryViewSet(viewsets.ModelViewSet):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date']

@api_view(['PUT'])
def update_task_time(request, pk):
    """
    API endpoint to update the start and end time of a task.
    """
    try:
        task = Task.objects.get(pk=pk)
    except Task.DoesNotExist:
        return Response({'detail': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    # Update only the provided fields
    task.time_start = data.get('time_start', task.time_start)
    task.time_end = data.get('time_end', task.time_end)  # Optional
    task.save()

    serializer = TaskSerializer(task)
    return Response(serializer.data, status=status.HTTP_200_OK)
