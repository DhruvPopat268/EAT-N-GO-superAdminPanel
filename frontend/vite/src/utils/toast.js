import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const toastStyles = {
  success: {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: '#ffffff',
    icon: CheckCircle,
    iconColor: '#ffffff'
  },
  error: {
    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    color: '#ffffff',
    icon: XCircle,
    iconColor: '#ffffff'
  },
  warning: {
    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    color: '#ffffff',
    icon: AlertTriangle,
    iconColor: '#ffffff'
  },
  info: {
    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    color: '#ffffff',
    icon: Info,
    iconColor: '#ffffff'
  }
};

const CustomToast = ({ type, message, onDismiss }) => {
  const style = toastStyles[type];
  const IconComponent = style.icon;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        borderRadius: '12px',
        background: style.background,
        color: style.color,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        minWidth: '300px',
        maxWidth: '500px',
        fontSize: '14px',
        fontWeight: '500',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <IconComponent size={20} color={style.iconColor} />
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: style.iconColor,
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.8,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.8'}
      >
        <X size={16} />
      </button>
    </div>
  );
};

const showToast = (type, message, options = {}) => {
  const defaultOptions = {
    duration: 4000,
    position: 'top-right',
    ...options
  };

  return toast.custom(
    (t) => (
      <CustomToast
        type={type}
        message={message}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ),
    defaultOptions
  );
};

export const Toast = {
  success: (message, options) => showToast('success', message, options),
  error: (message, options) => showToast('error', message, options),
  warning: (message, options) => showToast('warning', message, options),
  info: (message, options) => showToast('info', message, options),
  dismiss: (toastId) => toast.dismiss(toastId),
  dismissAll: () => toast.dismiss()
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

export default Toast;