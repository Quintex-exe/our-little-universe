import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from './App';
import { ToastProvider } from './components/ui';
import { ThemeProvider } from './theme/ThemeProvider';
import './styles/index.css';

// Hosted artifact pages can't use path routing, so that build keeps the route in memory.
const Router = import.meta.env.MODE === 'artifact' ? MemoryRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <App />
        </Router>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);
