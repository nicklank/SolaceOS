# backend/myapp/admin.py

from django.contrib import admin
from .models import Habit, HabitEntry

class HabitAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'created_at')
    search_fields = ('name',)

class HabitEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'habit', 'date', 'completed', 'note')
    search_fields = ('habit__name', 'date')
    list_filter = ('completed',)

admin.site.register(Habit, HabitAdmin)
admin.site.register(HabitEntry, HabitEntryAdmin)
