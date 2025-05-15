import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import NoticeBoardPage from './pages/NoticeBoard';
import VaultPage from './pages/Vault';
import Workspace from './pages/Workspace';
import NotFoundPage from './pages/NotFound';
import { ProtectedRoute, AuthLoginRoute } from './components/auth/ProtectedRoutes';

// The main App component doesn't access context directly
function App() {
  // Handle login success - can be empty now as AuthContext handles the state
  const handleLoginSuccess = () => {
    console.log('Login successful');
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <AuthLoginRoute onLoginSuccess={handleLoginSuccess} />
          } />
          
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
          
          <Route path="/notice-board" element={
            <ProtectedRoute>
              <Layout>
                <NoticeBoardPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/vault" element={
            <ProtectedRoute>
              <Layout>
                <VaultPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/workspace" element={
            <ProtectedRoute>
              <Layout>
                <Workspace />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/workspace/:projectId" element={
            <ProtectedRoute>
              <Layout>
                <Workspace />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
