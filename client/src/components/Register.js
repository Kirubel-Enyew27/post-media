
// Register.js
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistered, setRegistered] = useState(false);

  const handleRegister = async () => {
    try {
      // Make an API request to register the user
      // Replace 'http://localhost:3001/register' with your actual registration API endpoint
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok && (password===confirmPassword)) {
        // Registration successful
        setRegistered(true);
      } 
      
      else if(password!==confirmPassword){
        return <h5>The password didn't match</h5>
      }
      else {
        // Registration failed, handle errors
        return('Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  if (isRegistered) {
    // Redirect to login page after successful registration
    return <Navigate to="/login" />;
  }

  return (
    <div style={{padding:'50px'}}>
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        width:'60vh',
        height: '70vh',
        margin: 'auto',
        boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.3s ease-in-out',
      }}>      <h2>Register</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginBottom: '10px', padding: '8px', width: '200px', boxSizing: 'border-box' }}
        />     

        <input
        type="Email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: '10px', padding: '8px', width: '200px', boxSizing: 'border-box' }}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: '10px', padding: '8px', width: '200px', boxSizing: 'border-box' }}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ marginBottom: '10px', padding: '8px', width: '200px', boxSizing: 'border-box' }}
        />
        <button onClick={handleRegister}>Create Account</button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
