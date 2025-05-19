import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import NotFoundPage from './pages/NotFoundPage';
import ComingSoonPage from './pages/ComingSoonPage';
import BIMViewer from './pages/3dviewer/overview';
import CADViewerOverview from './pages/cadviewer/overview';
import CADViewerSection from './pages/cadviewer/section';
import CADViewerDetail from './pages/cadviewer/detail';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<ComingSoonPage title="Projekt" />} />
        <Route path="projects/:id" element={<ComingSoonPage title="Projektdetaljer" />} />
        
        {/* 3D Viewer Routes */}
        <Route path="3dviewer/overview" element={<BIMViewer />} />
        
        {/* CAD Viewer Routes */}
        <Route path="cadviewer/overview" element={<CADViewerOverview />} />
        <Route path="cadviewer/section" element={<CADViewerSection />} />
        <Route path="cadviewer/detail" element={<CADViewerDetail />} />
        
        {/* 404 - Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;