import React from 'react';

let toastQueue = [];
let toastListener = null;

const addToast = (message, severity) => {
  const toast = {
    id: Date.now(),
    message,
    severity,
    timestamp: Date.now()
  };
  
  toastQueue.push(toast);
  
  if (toastListener) {
    toastListener([...toastQueue]);
  }
  
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== toast.id);
    if (toastListener) {
      toastListener([...toastQueue]);
    }
  }, 4000);
};

export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);
  
  React.useEffect(() => {
    toastListener = setToasts;
    return () => {
      toastListener = null;
    };
  }, []);
  
  return {
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    warning: (message) => addToast(message, 'warning'),
    info: (message) => addToast(message, 'info'),
    toasts
  };
};

export const Toast = {
  success: (message) => addToast(message, 'success'),
  error: (message) => addToast(message, 'error'),
  warning: (message) => addToast(message, 'warning'),
  info: (message) => addToast(message, 'info')
};

export default Toast;