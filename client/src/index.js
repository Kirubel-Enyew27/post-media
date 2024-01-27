import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom'; 
import {AppProvider} from './components/AppContext'

import App from './App';

ReactDOM.render(
  <Router>
    <AppProvider>
       <App />
    </AppProvider>
  </Router>,
  document.getElementById('root')
);

