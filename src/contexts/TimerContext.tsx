"use client";
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

interface TimerData {
  timeLogId: number;
  startTime: Date;
  elapsedTime: number;
}

interface TimerContextType {
  timers: Record<number, TimerData>;
  startTimer: (taskId: number, timeLogId: number, startTime: Date | string) => void;
  stopTimer: (taskId: number) => void;
  initTimer: (taskId: number, timeLogId: number, startTime: Date | string) => void;
  clearAll: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timers, setTimers] = useState<Record<number, TimerData>>({});
  const intervalsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const updateTimer = useCallback((taskId: number) => {
    setTimers((prev) => {
      const timer = prev[taskId];
      if (!timer) return prev;
      
      const elapsed = Math.floor((new Date().getTime() - new Date(timer.startTime).getTime()) / 1000);
      
      return {
        ...prev,
        [taskId]: {
          ...timer,
          elapsedTime: elapsed,
        },
      };
    });
  }, []);

  const startTimer = useCallback((taskId: number, timeLogId: number, startTime: Date | string) => {
    if (intervalsRef.current.has(taskId)) {
      clearInterval(intervalsRef.current.get(taskId)!);
    }

    const start = new Date(startTime);

    setTimers((prev) => ({
      ...prev,
      [taskId]: {
        timeLogId,
        startTime: start,
        elapsedTime: 0,
      },
    }));

    const intervalId = setInterval(() => {
      updateTimer(taskId);
    }, 1000);

    intervalsRef.current.set(taskId, intervalId);
  }, [updateTimer]);

  const stopTimer = useCallback((taskId: number) => {
    if (intervalsRef.current.has(taskId)) {
      clearInterval(intervalsRef.current.get(taskId)!);
      intervalsRef.current.delete(taskId);
    }
    setTimers((prev) => {
      const newTimers = { ...prev };
      delete newTimers[taskId];
      return newTimers;
    });
  }, []);

  const initTimer = useCallback((taskId: number, timeLogId: number, startTime: Date | string) => {
    setTimers((prev) => {
      if (prev[taskId]) return prev;

      if (intervalsRef.current.has(taskId)) {
        clearInterval(intervalsRef.current.get(taskId)!);
      }

      const start = new Date(startTime);
      const elapsed = Math.floor((new Date().getTime() - start.getTime()) / 1000);

      const intervalId = setInterval(() => {
        updateTimer(taskId);
      }, 1000);
      intervalsRef.current.set(taskId, intervalId);

      return {
        ...prev,
        [taskId]: {
            timeLogId,
            startTime: start,
            elapsedTime: elapsed
        }
      };
    });
  }, [updateTimer]);

  const clearAll = useCallback(() => {
    intervalsRef.current.forEach((intervalId) => clearInterval(intervalId));
    intervalsRef.current.clear();
    setTimers({});
  }, []);
  
  useEffect(() => {
      return () => {
          intervalsRef.current.forEach((intervalId) => clearInterval(intervalId));
      }
  }, []);

  return (
    <TimerContext.Provider value={{ timers, startTimer, stopTimer, initTimer, clearAll }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
