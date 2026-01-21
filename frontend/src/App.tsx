import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import CookDashboard from './pages/cook/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/student/*" element={<StudentDashboard />} />
          <Route path="/cook/*" element={<CookDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;