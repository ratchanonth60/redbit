import { useToast } from 'react-native-toast-notifications';

export function showToast(message: string, type: 'success' | 'error') {
  toast.show(message, {
    type,
    duration: 3000,
    placement: 'bottom',
  });
}

// Usage
showToast('Post created successfully!', 'success');
