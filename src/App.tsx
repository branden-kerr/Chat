import React from 'react';
import { FirebaseProvider } from './components/Authentication/providers/FirebaseProvider';
import { AuthProvider } from './components/Authentication/context/authContext';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CustomRouter } from './components/CustomRouter';
import ThemeContext from "./Theme/ThemeContext";
import theme from "./Theme/theme";
import { Toaster } from 'react-hot-toast';


function App() {
  return (
    <FirebaseProvider>
      <Toaster position="top-center" />
      <AuthProvider>
        <ThemeContext.Provider value={theme}>
          <Router>
            <CustomRouter />
          </Router>
        </ThemeContext.Provider>
      </AuthProvider>
    </FirebaseProvider>
  );
}

export default App;

// TODO update all rules