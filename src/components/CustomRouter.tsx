import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './Layout/Layout';
import HomePage from './HomePage';
import { AuthContext } from './Authentication/context/authContext';
import Chat from './Chat/Chat';
import Landing from './Landing';

export const CustomRouter: React.FC = () => {
  const { user } = useContext(AuthContext);
  return (
    <>
      {user ? (
        <Layout>
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/" element={<Chat messages={[]} />} />
          </Routes>
        </Layout>
      ) : (
        <Layout isLoggedIn={false}>
          <Routes>
            <Route path="/" element={<Landing />} />
          </Routes>
        </Layout>
      )}
    </>
  );
}
