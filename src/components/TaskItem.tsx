"use client";

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useTimer } from '@/contexts/TimerContext';
import './TaskItem.css';

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  totalTime?: number;
  activeTimeLog?: {
    id: number;
    startTime: string;
  } | null;
}

interface TaskItemProps {
  task: Task;
  onUpdated: () => void;
  onDeleted: () => void;
}

export default function TaskItem({ task, onUpdated, onDeleted }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editStatus, setEditStatus] = useState(task.status);
  const [localTotalTime, setLocalTotalTime] = useState(task.totalTime || 0);
  const [startTimeDisplay, setStartTimeDisplay] = useState('');
  const [stopTimeDisplay, setStopTimeDisplay] = useState('');

  const { timers, startTimer, stopTimer, initTimer } = useTimer();
  const timerState = timers[task.id];
  const isTracking = !!timerState;
  const currentTimeLogId = timerState?.timeLogId || null;
  const elapsedTime = timerState?.elapsedTime || 0;
  const startTime = timerState?.startTime || null;

  const isCompleted = task.status === 'COMPLETED';

  useEffect(() => {
    if (task.totalTime !== undefined) {
      setLocalTotalTime(task.totalTime);
    }
  }, [task.totalTime]);

  useEffect(() => {
    if (task.activeTimeLog) {
      initTimer(task.id, task.activeTimeLog.id, task.activeTimeLog.startTime);
      setStartTimeDisplay(formatDateTime(task.activeTimeLog.startTime));
    }
  }, [task.activeTimeLog, task.id, initTimer]); // Added dependencies

  const statusColors: Record<string, string> = {
    PENDING: '#f59e0b',
    IN_PROGRESS: '#3b82f6',
    COMPLETED: '#10b981'
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatDateTime = (date: Date | string) => {
    return dayjs(date).format('HH:mm:ss');
  };

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const startTracking = async () => {
    try {
      const now = new Date();
      const response = await fetch('/api/time-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          startTime: now.toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        startTimer(task.id, data.timeLog.id, now.toISOString());
        setStartTimeDisplay(formatDateTime(now));
        setStopTimeDisplay('');
      }
    } catch (error) {
      console.error('Failed to start tracking:', error);
    }
  };

  const stopTracking = async () => {
    try {
      const stopTime = new Date();
      const startedAt = startTime;
      const duration = startedAt ? Math.floor((stopTime.getTime() - new Date(startedAt).getTime()) / 1000) : 0;
      setStopTimeDisplay(formatDateTime(stopTime));
      stopTimer(task.id);
      if (duration > 0) {
        setLocalTotalTime((prev) => prev + duration);
      }
      if (currentTimeLogId) {
        const response = await fetch(`/api/time-logs/${currentTimeLogId}/stop`, {
          method: 'POST'
        });
        if (response.ok) {
          onUpdated();
        }
      }
    } catch (error) {
      console.error('Failed to stop tracking:', error);
    }
  };

  const saveEdit = async () => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          status: editStatus
        })
      });

      if (response.ok) {
        setEditing(false);
        onUpdated();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onDeleted();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const completeTask = async () => {
    try {
        const response = await fetch(`/api/tasks/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'COMPLETED' })
        });
        if (response.ok) {
            onUpdated();
        }
    } catch (error) {
        console.error('Failed to complete task:', error);
    }
  };

  const reopenTask = async () => {
    try {
        const response = await fetch(`/api/tasks/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'PENDING' })
        });
        if (response.ok) {
            onUpdated();
        }
    } catch (error) {
        console.error('Failed to reopen task:', error);
    }
  };

  return (
    <div className="task-item">
      <div className="task-header">
        <div className="task-info">
          {editing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full p-2 mb-2 bg-gray-700 rounded border border-gray-600 text-white"
            />
          ) : (
            <h3>{task.title}</h3>
          )}
          {editing ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
            />
          ) : (
            task.description && <p className="task-description">{task.description}</p>
          )}
        </div>
        <div className="task-actions-header">
          <span 
            className={`task-status ${isCompleted ? 'cursor-pointer hover:opacity-80' : ''}`}
            style={{ color: statusColors[task.status], borderColor: statusColors[task.status] }}
            onClick={isCompleted ? reopenTask : undefined}
            title={isCompleted ? "Click to reopen task" : undefined}
          >
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="task-footer">
        <div className="task-time-info">
          {isTracking && (
            <div className="timer-active">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatTime(elapsedTime)}</span>
            </div>
          )}
          <div className="flex justify-between items-end mt-2">
             <div>
                 <div className="time-label">Total Time</div>
                 <div className="time-value">{formatTotalTime(localTotalTime)}</div>
             </div>
             {(startTimeDisplay || stopTimeDisplay) && (
                 <div className="text-right text-xs text-gray-400">
                     {startTimeDisplay && <div>Started: {startTimeDisplay}</div>}
                     {stopTimeDisplay && <div>Stopped: {stopTimeDisplay}</div>}
                 </div>
             )}
          </div>
        </div>

        <div className="task-actions">
          {isTracking ? (
            <button className="action-btn btn-stop" onClick={stopTracking}>
              STOP
            </button>
          ) : (
            <button 
              className="action-btn btn-start" 
              onClick={startTracking}
              disabled={isCompleted}
            >
              START
            </button>
          )}

          {!isCompleted && (
            <button className="action-btn btn-complete" onClick={completeTask}>
              COMPLETE
            </button>
          )}

          {editing ? (
             <button className="action-btn btn-start" onClick={saveEdit}>
                 SAVE
             </button>
          ) : (
             <button 
               className="action-btn btn-edit" 
               onClick={() => setEditing(true)}
               disabled={isCompleted}
             >
                 EDIT
             </button>
          )}

          <button className="action-btn btn-delete" onClick={deleteTask}>
             DELETE
          </button>
        </div>
      </div>
    </div>
  );
}
