import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-200" />;
      case "error":
        return <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-200" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-200" />;
      case "info":
        return <Info className="h-5 w-5 sm:h-6 sm:w-6 text-blue-200" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return "border-green-400/80 bg-green-800/50 text-green-100 shadow-xl shadow-green-900/40";
      case "error":
        return "border-red-400/80 bg-red-800/50 text-red-100 shadow-xl shadow-red-900/40";
      case "warning":
        return "border-yellow-400/80 bg-yellow-800/50 text-yellow-100 shadow-xl shadow-yellow-900/40";
      case "info":
        return "border-blue-400/80 bg-blue-800/50 text-blue-100 shadow-xl shadow-blue-900/40";
    }
  };

  return (
    <div
      className={`relative w-11/12 max-w-md sm:max-w-lg md:max-w-xl transition-all duration-300 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      <div
        className={`p-4 sm:p-6 rounded-xl border-2 backdrop-blur-md bg-gray-900/80 shadow-2xl ${getColors()}`}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm sm:text-base">{title}</p>
            {message && (
              <p className="mt-1 text-xs sm:text-sm opacity-90 leading-relaxed">{message}</p>
            )}
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(id), 300);
            }}
            className="flex-shrink-0 text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      type: ToastType;
      title: string;
      message?: string;
    }>
  >([]);

  const showToast = (type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
  };
};