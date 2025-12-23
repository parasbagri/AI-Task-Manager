"use client";

import React, { useState } from 'react';
import './CreateTaskForm.css';

interface CreateTaskFormProps {
  onTaskCreated?: () => void;
}

export default function CreateTaskForm({ onTaskCreated }: CreateTaskFormProps) {
  const [userInput, setUserInput] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const enhanceWithAI = async () => {
    console.log('Enhance with AI clicked:', userInput);
    if (!userInput.trim()) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/tasks/ai-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput })
      });

      if (response.ok) {
        const data = await response.json();
        setTitle(data.title || userInput);
        setDescription(data.description || '');
      } else {
        setError('Failed to enhance task');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || null
        })
      });

      if (response.ok) {
        setUserInput('');
        setTitle('');
        setDescription('');
        setUseAI(false);
        if (onTaskCreated) {
          onTaskCreated();
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create task');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-task-card">
      <h2>Create New Task</h2>
      
      <div className="ai-section">
        <label className="ai-checkbox">
          <input
            type="checkbox"
            checked={useAI}
            onChange={(e) => setUseAI(e.target.checked)}
          />
          <span className="checkmark"></span>
          Use AI to enhance task
        </label>
      </div>

      {useAI && (
        <div className="form-group">
          <label htmlFor="userInput">Describe your task (natural language)</label>
          <textarea
            id="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g., follow up with designer"
            disabled={loading}
            rows={2}
          ></textarea>
          <button
            type="button"
            className="enhance-btn"
            onClick={enhanceWithAI}
            disabled={loading || !userInput.trim()}
          >
            {loading ? 'Enhancing...' : '✨ Enhance with AI'}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Task Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            disabled={loading}
            rows={3}
          ></textarea>
        </div>

        {error && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            'Creating...'
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Task
            </>
          )}
        </button>
      </form>
    </div>
  );
}
