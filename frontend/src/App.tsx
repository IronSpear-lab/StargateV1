import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Sidor
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import MessageBoard from './pages/MessageBoard';
import ProjectList from './pages/ProjectList';
import ProjectDetails from './pages/ProjectDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Files from './pages/Files';
import Wiki from './pages/Wiki';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';

// Protected route-komponent
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// App-huvudkomponent
const AppContent = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Layout>
              <Calendar />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/messageboard" element={
          <ProtectedRoute>
            <Layout>
              <MessageBoard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/projects" element={
          <ProtectedRoute>
            <Layout>
              <ProjectList />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/projects/:id" element={
          <ProtectedRoute>
            <Layout>
              <ProjectDetails />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/files" element={
          <ProtectedRoute>
            <Layout>
              <Files />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/wiki" element={
          <ProtectedRoute>
            <Layout>
              <Wiki />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/tasks" element={
          <ProtectedRoute>
            <Layout>
              <Tasks />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Default route redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// App med providers
const App = () => {
  return (
    <CssVarsProvider defaultMode="system">
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </CssVarsProvider>
  );
};

export default App;