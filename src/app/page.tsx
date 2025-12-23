"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TaskList from '@/components/TaskList';
import CreateTaskForm from '@/components/CreateTaskForm';
import './home.css';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleTaskCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="page-container">
      <div className="content-grid">
        <div className="section-card">
          <h2 className="section-title">
            <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Create New Task
          </h2>
          <CreateTaskForm onTaskCreated={handleTaskCreated} />
        </div>

        <div className="section-card task-list-section">
          <h2 className="section-title">
            <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
            </svg>
            Your Tasks
          </h2>
          <TaskList refreshTrigger={refreshKey} />
        </div>
      </div>
    </div>
  );
}
