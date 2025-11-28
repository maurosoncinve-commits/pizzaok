
import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (password: string): boolean => {
    // Password provided by the user
    const CORRECT_PASSWORD = '060821';
    if (password === CORRECT_PASSWORD) {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111] to-[#222] text-gray-100 font-sans">
      {isLoggedIn ? (
        <Dashboard />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
