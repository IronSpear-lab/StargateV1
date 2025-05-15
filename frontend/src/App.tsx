import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import NotFoundPage from './pages/NotFoundPage';

// Vault pages
import HomePage from './pages/vault/home/HomePage';
import CommentsPage from './pages/vault/comments/CommentsPage';
import ReviewPage from './pages/vault/review/ReviewPage';
import FilesPage from './pages/vault/files/FilesPage';
import VersionsPage from './pages/vault/versions/VersionsPage';
import MeetingsPage from './pages/vault/meetings/MeetingsPage';

// Anpassa temat för att matcha bilden
const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: '#F0F4FF',
          100: '#DDE7FF',
          200: '#B3C7FF',
          300: '#89A7FF',
          400: '#6687FF', 
          500: '#4361EE', // Huvudfärg som matchar ValvX logotypens lila
          600: '#3A4CD8',
          700: '#3038C3',
          800: '#2A25A8',
          900: '#24168E',
        },
      },
    },
  },
  fontFamily: {
    body: '"Inter", var(--joy-fontFamily-fallback)',
    display: '"Inter", var(--joy-fontFamily-fallback)',
  },
});

function App() {
  return (
    <CssVarsProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Protected routes with layout */}
          <Route element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<ComingSoonPage title="Projekt" />} />
            <Route path="tasks" element={<ComingSoonPage title="Uppgifter" />} />
            <Route path="files" element={<ComingSoonPage title="Dokument" />} />
            <Route path="team" element={<ComingSoonPage title="Team" />} />
            <Route path="settings" element={<ComingSoonPage title="Inställningar" />} />
            
            {/* Vault routes */}
            <Route path="vault">
              <Route path="home" element={<HomePage />} />
              <Route path="comments" element={<CommentsPage />} />
              <Route path="review" element={<ReviewPage />} />
              <Route path="files" element={<FilesPage />} />
              <Route path="versions" element={<VersionsPage />} />
              <Route path="meetings" element={<MeetingsPage />} />
            </Route>
          </Route>
          
          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </CssVarsProvider>
  );
}

// Simple component to show for routes not yet implemented
const ComingSoonPage = ({ title }: { title: string }) => (
  <div style={{ padding: '20px' }}>
    <h1>{title}</h1>
    <p>Denna sida är under utveckling och kommer snart.</p>
  </div>
);

export default App;
