import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import apiService from '../apiService';
import './TaskView.css';
import { useCalendar } from './CalendarContext';

const TaskView = () => {
    const { selectedDate, setSelectedDate } = useCalendar();
    const [newTask, setNewTask] = useState("");
    const [tasksByDate, setTasksByDate] = useState({});

    const formatDateToYYYYMMDD = (date) => {
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        return utcDate.toISOString().split('T')[0];
    };

    const getStartOfWeek = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - (day === 0 ? 6 : day - 1);
        return new Date(date.setDate(diff));
    };

    const generateWeekDates = (startOfWeek) => {
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            weekDates.push(date);
        }
        return weekDates;
    };

    const fetchTasksForWeek = async (weekDates) => {
        const tasksByDateTemp = {};
        for (const date of weekDates) {
            const formattedDate = formatDateToYYYYMMDD(date);
            try {
                const tasks = await apiService.getTasksByDate(formattedDate);
                tasksByDateTemp[formattedDate] = tasks.sort((a, b) => a.order - b.order);
            } catch (error) {
                console.error(`Error fetching tasks for date ${formattedDate}:`, error);
            }
        }
        setTasksByDate(tasksByDateTemp);
    };

    useEffect(() => {
        const correctedDate = new Date(selectedDate);
        correctedDate.setDate(correctedDate.getDate() + 1);
        const startOfWeek = getStartOfWeek(correctedDate);
        const weekDates = generateWeekDates(startOfWeek);
        fetchTasksForWeek(weekDates);
    }, [selectedDate]);

    const handleAddTask = async (date) => {
        if (newTask.trim()) {
            const formattedDate = formatDateToYYYYMMDD(date);
            try {
                const taskData = {
                    name: newTask,
                    completed: false,
                    date: formattedDate,
                    order: tasksByDate[formattedDate]?.length || 0 // Use the length of tasks as the order
                };
                const response = await apiService.addTask(taskData);
                setTasksByDate(prevTasksByDate => ({
                    ...prevTasksByDate,
                    [formattedDate]: [...(prevTasksByDate[formattedDate] || []), response]
                }));
                setNewTask("");
            } catch (error) {
                console.error('Error adding task:', error);
            }
        }
    };

    const handleToggleCompletion = async (taskId, taskDate) => {
        try {
            const updatedTask = await apiService.toggleTaskCompletion(taskId);
            setTasksByDate(prevTasksByDate => ({
                ...prevTasksByDate,
                [taskDate]: prevTasksByDate[taskDate].map(task =>
                    task.id === taskId ? updatedTask : task
                ),
            }));
        } catch (error) {
            console.error('Error toggling task completion:', error);
        }
    };

    const handleDeleteTask = async (taskId, taskDate) => {
        try {
            await apiService.deleteTask(taskId);
            setTasksByDate(prevTasksByDate => ({
                ...prevTasksByDate,
                [taskDate]: prevTasksByDate[taskDate].filter(task => task.id !== taskId)
            }));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const onDragEnd = async (result, formattedDate) => {
        if (!result.destination) return;

        // Reorder tasks in the local state
        const reorderedTasks = Array.from(tasksByDate[formattedDate]);
        const [movedTask] = reorderedTasks.splice(result.source.index, 1);
        reorderedTasks.splice(result.destination.index, 0, movedTask);

        // Update the order of each task in the reordered list
        const updatedTasks = reorderedTasks.map((task, index) => ({
            ...task,
            order: index // Update the order based on the new index
        }));

        // Update the local state with the reordered tasks
        setTasksByDate(prevTasksByDate => ({
            ...prevTasksByDate,
            [formattedDate]: updatedTasks
        }));

        // Persist the new order to the backend by updating the order of each task
        try {
            await Promise.all(
                updatedTasks.map(task => apiService.updateTaskOrder(task.id, task.order))
            );
            console.log('Task order updated successfully');
        } catch (error) {
            console.error('Error updating task order:', error);
        }
    };

    const navigateWeek = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        setSelectedDate(formatDateToYYYYMMDD(newDate));
    };

    const resetToToday = () => {
        setSelectedDate(formatDateToYYYYMMDD(new Date()));
    };

    const correctedDate = new Date(selectedDate);
    correctedDate.setDate(correctedDate.getDate() + 1);
    const startOfWeek = getStartOfWeek(correctedDate);
    const weekDates = generateWeekDates(startOfWeek);

    return (
        <div className="task-view-container">
            <div className="task-view-controls">
                <button onClick={() => navigateWeek('previous')}>Previous Week</button>
                <button onClick={resetToToday}>Reset to Today</button>
                <button onClick={() => navigateWeek('next')}>Next Week</button>
            </div>
            <h2>{`Week of ${startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}</h2>
            <div className="task-table">
                {weekDates.map((date, index) => {
                    const formattedDate = formatDateToYYYYMMDD(date);
                    const tasks = tasksByDate[formattedDate] || [];
                    return (
                        <div className="task-table-row" key={index}>
                            <div className="task-table-cell date-cell">
                                {date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                                <br />
                                {date.getDate()}
                            </div>
                            <div className="task-table-cell tasks-cell">
                                <DragDropContext onDragEnd={(result) => onDragEnd(result, formattedDate)}>
                                    <Droppable droppableId={formattedDate}>
                                        {(provided) => (
                                            <ul className="task-list" {...provided.droppableProps} ref={provided.innerRef}>
                                                {tasks.map((task, taskIndex) => (
                                                    <Draggable key={task.id} draggableId={task.id.toString()} index={taskIndex}>
                                                        {(provided) => (
                                                            <li
                                                                className={`task-item ${task.completed ? 'completed' : ''}`}
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                <span onClick={() => handleToggleCompletion(task.id, formattedDate)}>
                                                                    {task.name}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleDeleteTask(task.id, formattedDate)}
                                                                    className="delete-task-button"
                                                                    aria-label="Delete task"
                                                                >
                                                                    ❌
                                                                </button>
                                                            </li>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </ul>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                                <div className="task-input-container">
                                    <input
                                        type="text"
                                        value={newTask}
                                        onChange={(e) => setNewTask(e.target.value)}
                                        placeholder="Enter a new task..."
                                    />
                                    <button onClick={() => handleAddTask(date)}>Add Task</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TaskView;
