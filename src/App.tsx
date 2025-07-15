import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { apiService } from './services/api';
import { getAuthToken, isAuthenticated } from './utils/auth';
import { User } from './types';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = getAuthToken();
      if (token && isAuthenticated()) {
        apiService.setToken(token);
        const response = await apiService.healthCheck();
        
        if (response.status && response.data) {
          setUser({
            name: response.data.name,
            clientcode: response.data.clientcode,
            email: response.data.email,
            mobileno: response.data.mobileno,
          });
          setIsLoggedIn(true);
        } else {
          // If healthCheck fails but we have a token, show login
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    checkAuthStatus();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-full mx-auto mb-4 shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-600 mt-4 font-medium">Loading Algo Trading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {isLoggedIn && user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;