"use client";

import React, { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import './TaskList.css';

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

interface TaskListProps {
  refreshTrigger: number;
}

export default function TaskList({ refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  const handleTaskUpdated = () => {
    loadTasks();
  };

  const handleTaskDeleted = () => {
    loadTasks();
  };

  const visibleTasks = tasks.filter((t) =>
    (t.title || '')
      .toString()
      .toLowerCase()
      .includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="tasks-container">
      <div className="tasks-section">
        <div className="search-row">
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="no-tasks">No tasks yet. Create one!</div>
        ) : (
          <div className="tasks-list">
            {visibleTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdated={handleTaskUpdated}
                onDeleted={handleTaskDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
