import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <AppRoutes />
            </main>
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
