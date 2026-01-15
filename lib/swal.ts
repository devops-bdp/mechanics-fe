import Swal from 'sweetalert2';

// Success Alert
export const showSuccess = (message: string, title: string = 'Success!') => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: '#10b981',
    timer: 3000,
    timerProgressBar: true,
  });
};

// Error Alert
export const showError = (message: string, title: string = 'Error!') => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: '#ef4444',
  });
};

// Warning Alert
export const showWarning = (message: string, title: string = 'Warning!') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonColor: '#f59e0b',
  });
};

// Info Alert
export const showInfo = (message: string, title: string = 'Info') => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonColor: '#3b82f6',
  });
};

// Confirm Dialog
export const showConfirm = (
  message: string,
  title: string = 'Are you sure?',
  confirmText: string = 'Yes',
  cancelText: string = 'Cancel'
) => {
  return Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
};

// Loading Alert
export const showLoading = (message: string = 'Please wait...') => {
  return Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Close any open Swal
export const closeSwal = () => {
  Swal.close();
};

