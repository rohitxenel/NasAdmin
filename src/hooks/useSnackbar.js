'use client';
import { useState, useCallback } from 'react';

export function useSnackbar() {
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  const showSnackbar = useCallback((message, type = 'success') => {
    setSnackbar({ visible: true, message, type });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    snackbar,
    showSnackbar,
    hideSnackbar,
  };
}
