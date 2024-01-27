import React,{useContext, useState} from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Message from './Message';
import Notification from './Notification';
import Profile from './Profile';
import {AppContext} from './AppContext'


export default function Dashboard() {

  const { logout } = useContext(AppContext);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };


  return (
    <div className = 'container'>

      <div className="menu-btn" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <ul className={`menu ${isMenuOpen ? 'open' : ''}`}>
        <li><Link to='/'>Home</Link></li>
        <li><Link to='/message'>Message</Link></li>
        <li><Link to='/notification'>Notification</Link></li>
        <li><Link to='/profile'>Profile</Link></li>
        <li style={{ marginLeft: 'auto' }}>
          <Link onClick={logout}>Log Out</Link>
        </li>
      </ul>

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/message' element={<Message />} />
        <Route path='/notification' element={<Notification />} />
        <Route path='/profile' element={<Profile />} />
      </Routes>
    </div>
  );
}

