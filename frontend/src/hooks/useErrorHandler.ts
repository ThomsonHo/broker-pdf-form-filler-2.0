import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import axios from 'axios';

export const useErrorHandler = () => {
  const { enqueueSnackbar } = useSnackbar();

  const handleError = useCallback((error: unknown) => {
    let message = 'An unexpected error occurred';

    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    enqueueSnackbar(message, {
      variant: 'error',
      autoHideDuration: 5000,
    });
  }, [enqueueSnackbar]);

  return { handleError };
}; 