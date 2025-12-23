"use client";

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import './logs.css';

interface TimeLog {
  id: number;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  task: {
    id: number;
    title: string;
  };
}

interface LogsClientProps {
  initialTimeLogs: TimeLog[];
}

interface GroupedLogs {
  taskId: number;
  title: string;
  logs: TimeLog[];
}

export default function LogsClient({ initialTimeLogs }: LogsClientProps) {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(initialTimeLogs);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  // Re-fetch logs on mount to ensure freshness (matching Svelte behavior)
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/time-logs');
        if (response.ok) {
          const json = await response.json();
          setTimeLogs(json.timeLogs || []);
        }
      } catch (e) {
        console.error('Failed to refresh time logs:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const groupByTask = (logs: TimeLog[]): GroupedLogs[] => {
    const map = new Map<number, GroupedLogs>();
    for (const log of logs) {
      const taskId = log.task.id;
      if (!map.has(taskId)) {
        map.set(taskId, { taskId, title: log.task.title, logs: [] });
      }
      map.get(taskId)!.logs.push(log);
    }
    const arr = Array.from(map.values());
    arr.forEach(group => group.logs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
    arr.sort((a, b) => a.title.localeCompare(b.title));
    return arr;
  };

  const grouped = groupByTask(timeLogs);
  const filteredGrouped = grouped.filter((g) =>
    (g.title || '')
      .toString()
      .toLowerCase()
      .includes((query || '').toLowerCase())
  );

  const formatDateTime = (dt: string) => {
    return dayjs(dt).format('YYYY-MM-DD HH:mm:ss');
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return 'Running...';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const deleteLog = async (logId: number) => {
    if (!confirm('Delete this time log?')) return;
    try {
      const res = await fetch(`/api/time-logs/${logId}`, { method: 'DELETE' });
      if (res.ok) {
        setTimeLogs(prev => prev.filter(l => l.id !== logId));
      }
    } catch (e) {
      console.error('Failed to delete log:', e);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm('Delete this task and all its logs?')) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        setTimeLogs(prev => prev.filter(l => l.task.id !== taskId));
      }
    } catch (e) {
      console.error('Failed to delete task:', e);
    }
  };

  return (
    <div className="logs-page">
      <div className="logs-container">
        <h1>Time Logs</h1>
        <div className="search-row">
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {loading && timeLogs.length === 0 ? (
          <div className="loading">Loading...</div>
        ) : filteredGrouped.length === 0 ? (
          <div className="no-logs">No time logs found.</div>
        ) : (
          <div>
            {filteredGrouped.map(group => (
              <div key={group.taskId} className="task-group">
                <div className="group-header">
                  <h2>{group.title}</h2>
                  <button className="btn-delete-task" onClick={() => deleteTask(group.taskId)}>
                    Delete Task & Logs
                  </button>
                </div>
                <div className="logs-list">
                  {group.logs.map(log => (
                    <div key={log.id} className="log-item">
                      <div className="log-info">
                        <span>{formatDateTime(log.startTime)}</span>
                        <span>→</span>
                        <span>{log.endTime ? formatDateTime(log.endTime) : 'Now'}</span>
                        <span style={{ fontWeight: 'bold', marginLeft: '10px' }}>
                          ({formatDuration(log.duration)})
                        </span>
                      </div>
                      <div className="log-actions">
                        <button className="btn-delete-log" onClick={() => deleteLog(log.id)} title="Delete Log">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
