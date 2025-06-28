from rest_framework import serializers
from .models import Habit, HabitEntry
from .models import Task
from .models import JournalEntry

class HabitEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitEntry
        fields = ['id', 'habit', 'date', 'completed', 'customValue']

class HabitSerializer(serializers.ModelSerializer):
    entries = HabitEntrySerializer(many=True, read_only=True)

    class Meta:
        model = Habit
        fields = ['id', 'name', 'created_at', 'entries']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = ['id', 'date', 'entry_text']