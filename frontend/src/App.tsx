import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import NotFoundPage from './pages/NotFoundPage';
import { ProjectProvider } from './contexts/ProjectContext';
import theme from './theme'; // Importera vårt anpassade SEB-tema

// Vault pages
import HomePage from './pages/vault/home/HomePage';
import CommentsPage from './pages/vault/comments/CommentsPage';
import ReviewPage from './pages/vault/review/ReviewPage';
import FilesPage from './pages/vault/files/FilesPage';
import VersionsPage from './pages/vault/versions/VersionsPage';
import MeetingsPage from './pages/vault/meetings/MeetingsPage';

// Folder pages
import FolderPage from './pages/folders/FolderPage';
import FolderListPage from './pages/folders/FolderListPage';

// Nu använder vi det importerade SEB-temat istället för detta

// The main App component doesn't access context directly
function App() {
  // Handle login success - can be empty now as AuthContext handles the state
  const handleLoginSuccess = () => {
    console.log('Login successful');
  };

  return (

    <CssVarsProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <ProjectProvider>
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
              
              {/* Folder routes */}
              <Route path="folders" element={<FolderListPage />} />
              <Route path="folders/:slug" element={<FolderPage />} />
              
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
      </ProjectProvider>
    </CssVarsProvider>

  );
}

export default App;
