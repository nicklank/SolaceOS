# backend/myapp/models.py

from django.db import models

class Habit(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class HabitEntry(models.Model):
    habit = models.ForeignKey(Habit, related_name='entries', on_delete=models.CASCADE)
    date = models.DateField()
    completed = models.BooleanField(default=False)
    status = models.BooleanField(default=False)
    note = models.TextField(blank=True, null=True)
    customValue = models.CharField(max_length=1, blank=True, null=True)  #double click input storage

    def __str__(self):
        return f"{self.habit.name} on {self.date}: {'Completed' if self.status else 'Not Completed'}"

class Task(models.Model):
    name = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    date = models.DateField()
    time_start = models.TimeField(blank=True, null=True)
    time_end = models.TimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} on {self.date}{' at ' + str(self.time) if self.time else ''}"

class JournalEntry(models.Model):
    date = models.DateField()
    entry_text = models.TextField()

    def __str__(self):
        return f"Journal Entry for {self.date}"