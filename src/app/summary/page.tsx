"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import dayjs from 'dayjs';
import './summary.css';

interface ActiveTimer {
  id: number;
  taskId: number;
  taskTitle: string;
  startTime: string;
  elapsedTime: number;
}

interface TimeLog {
  id: number;
  taskTitle: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
}

interface SummaryData {
  date: string;
  totalTime: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  tasksWorkedOn: number;
  activeTimers: ActiveTimer[];
  timeLogs: TimeLog[];
}

export default function SummaryPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/summary?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSummary();
      const interval = setInterval(loadSummary, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, selectedDate]);

  if (authLoading || (!summary && loading)) {
    return <div className="flex justify-center items-center min-h-screen text-white">Loading...</div>;
  }

  if (!isAuthenticated) return null;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatDateTime = (dateTime: string) => {
    return dayjs(dateTime).format('HH:mm:ss');
  };

  return (
    <div className="summary-page">
      <div className="summary-container">
        <h1 className="page-title">Daily Summary</h1>

        {loading && !summary ? (
          <div className="loading">Loading...</div>
        ) : summary ? (
          <div className="summary-layout">
            {/* Left Column */}
            <div className="summary-left">
              {/* Date Picker Card */}
              <div className="date-picker-card">
                <h2>Daily Summary</h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={dayjs().format('YYYY-MM-DD')}
                  className="beautiful-date-picker"
                />
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>TOTAL TIME TRACKED</h3>
                  <p className="stat-value">{formatTime(summary.totalTime)}</p>
                </div>
                <div className="stat-card">
                  <h3>COMPLETED TASKS</h3>
                  <p className="stat-value">{summary.completedTasks}</p>
                </div>
                <div className="stat-card">
                  <h3>IN PROGRESS</h3>
                  <p className="stat-value">{summary.inProgressTasks}</p>
                </div>
                <div className="stat-card">
                  <h3>PENDING</h3>
                  <p className="stat-value">{summary.pendingTasks}</p>
                </div>
                <div className="stat-card">
                  <h3>TASKS WORKED ON</h3>
                  <p className="stat-value">{summary.tasksWorkedOn}</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="summary-right">
              {/* Active Timer Card */}
              <div className="info-card">
                <h2>Currently Running Task Time</h2>
                <div className="active-task-container">
                  {summary.activeTimers.length > 0 ? (
                    <div className="active-timer-display">
                      <div className="active-timer-content">
                        <span className="active-task-title">{summary.activeTimers[0].taskTitle}</span>
                        <span className="running-time">{formatTime(summary.activeTimers[0].elapsedTime)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="no-active-tasks">
                      No tasks currently running
                    </div>
                  )}
                </div>
              </div>

              {/* Logs Card */}
              <div className="info-card">
                <h2>All Task Time Logs</h2>
                <div className="logs-list">
                  {summary.timeLogs.length === 0 ? (
                    <div className="no-logs">No activity recorded for this day</div>
                  ) : (
                    summary.timeLogs.map((log) => (
                      <div key={log.id} className="log-item">
                        <div className="log-details">
                          <span className="log-title">{log.taskTitle}</span>
                          <span className="log-time-range">
                            {formatDateTime(log.startTime)} - {log.endTime ? formatDateTime(log.endTime) : '...'}
                          </span>
                        </div>
                        <div className="log-duration">
                          {log.duration ? formatTime(log.duration) : 'Running'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
