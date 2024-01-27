import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './components/AppContext';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import './App.css'

const App = () => {
  return (
      <div className ='App'>
        <Routes>
          <Route path="*" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>

  );
};

const Main = () => {
  const { authenticated } = useContext(AppContext);

  if (!authenticated) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/login" />;
  }

  return <Dashboard />;
};

export default App;
