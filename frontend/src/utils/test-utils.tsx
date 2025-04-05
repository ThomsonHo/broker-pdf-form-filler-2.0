import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import theme from '@/theme';

function render(ui: React.ReactElement, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);
  
  return rtlRender(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

// re-export everything
export * from '@testing-library/react';

// override render method
export { render }; 