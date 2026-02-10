import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notify: (message: string, type?: NotificationType, durationMs?: number) => void;
  success: (message: string, durationMs?: number) => void;
  error: (message: string, durationMs?: number) => void;
  info: (message: string, durationMs?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const ToastStack: React.FC<{
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}> = ({ notifications, onDismiss }) => {
  const styleByType: Record<NotificationType, string> = {
    success: 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100',
    error: 'bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100',
    info: 'bg-blue-100 dark:bg-blue-950 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100'
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-[min(90vw,24rem)]">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm transition ${styleByType[notification.type]}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold break-words">{notification.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(notification.id)}
              className="text-xs font-bold opacity-70 hover:opacity-100 transition"
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, type: NotificationType = 'info', durationMs = 3000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setNotifications((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => dismiss(id), durationMs);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      notify,
      success: (message: string, durationMs?: number) => notify(message, 'success', durationMs),
      error: (message: string, durationMs?: number) => notify(message, 'error', durationMs),
      info: (message: string, durationMs?: number) => notify(message, 'info', durationMs)
    }),
    [notify]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastStack notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
