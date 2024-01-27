// Login.js
import React, { useState, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AppContext } from './AppContext';
import Cookies from 'js-cookie';


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const { authenticated, login } = useContext(AppContext);
  const [loginError, setLoginError] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  const handleLogin = async () => {
    try {
      // Make an API request to authenticate the user
      // Replace 'http://localhost:3001/login' with your actual login API endpoint
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Login successful

        const data = await response.json();

        // Extract the token from the response data
        const token = data.token;

        Cookies.set('token', token, { expires: 365 });

        login();
      } 

      else {
        // Login failed, handle errors
        setLoginError(true);
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleForgotPassword = async () => {
    try {
      // Make an API request to handle forgot password
      // Replace 'http://localhost:3001/forgot-password' with your actual API endpoint
      const response = await fetch('http://localhost:3001/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        console.log('Reset email sent successfully.');
        // Optionally, provide user feedback in the UI
      } else {
        console.error('Failed to send reset email.');
        // Optionally, provide user feedback in the UI
      }
    } catch (error) {
      console.error('Error during forgot password:', error);
      // Optionally, provide user feedback in the UI
    }
  };

  if (authenticated) {
    // Redirect to home page after successful login
    return <Navigate to="/" />;
  }

  return (
    <div style={{ padding: '50px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          width: '60vh',
          height: '70vh',
          margin: 'auto',
          boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)',
          transition: 'box-shadow 0.3s ease-in-out',
          backgroundColor:'#1d1b1b',
          color: 'white'
        }}
      >
        {forgotPassword ? (
          <>
            <h2>Forgot Password</h2>
            <p>Enter your email to receive a password reset link:</p>
            {/* Add input for email */}
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: '10px', padding: '8px', width: '200px', boxSizing: 'border-box' }}
            />
            <button onClick={handleForgotPassword}>Send Reset Link</button>
            <p>
              Remember your password?     
              <Link to="#" onClick={() => setForgotPassword(false)} style={{ color: 'blue', paddingLeft:'10px' }}>
                Go back to login
              </Link>
      
            </p>
          </>
        ) : (
          <>
            <h2>Login</h2>
            {/* ... (existing input fields and button) */}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ marginBottom: '10px', padding: '8px', width: '200px', boxSizing: 'border-box', border:'1px solid #05822f' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginBottom: '10px', padding: '8px', width: '200px', boxSizing: 'border-box', border:'1px solid #05822f' }}
            />
            <button onClick={handleLogin} className="login-button" style={{color:'white'}}>Login</button>
            <p>
              <Link to="#" onClick={() => setForgotPassword(true)} style={{ color: 'blue' }}>
                Forgot your password?
              </Link>
            </p>
            {loginError && <p style={{ color: 'red' }}>Login failed. Please check your credentials and try again.</p>}
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
