import React, { ReactNode, useState } from 'react';
import Header from './Header';
import { SignUpModalProvider, SettingsModalProvider, NewChatModalProvider } from '../../Contexts/ModalContext';

type LayoutProps = {
  children: ReactNode;
  isLoggedIn?: boolean;
};

const layoutStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(12, 1fr)',
  gridTemplateRows: 'repeat(12, 1fr)',
  height: '100vh',
  width: '100vw',
};

const mainStyles: React.CSSProperties = {
  flex: 1,
};

const Layout: React.FC<LayoutProps> = ({ children, isLoggedIn }) => {

  return (
    <SignUpModalProvider>
      <SettingsModalProvider>
        <NewChatModalProvider>

          {isLoggedIn !== false ? (
            <div style={layoutStyles}>
              <Header />
              <div
                style={{
                  gridRow: '2 / 13',
                  backgroundColor: '#13141A',
                  gridColumn: '1 / 13',
                  width: '100%',
                  height: '100%',
                }}
              >
                {children}
              </div>
            </div>
          ) : (
            <div style={layoutStyles}>
              <Header />
              <div
                style={{
                  padding: '0 150px',
                  gridRow: '2 / 13',
                  backgroundColor: '#13141A',
                  gridColumn: '1 / 13',
                  width: '100%',
                  height: '100%',
                }}
              >
                {children}
              </div>
            </div>
          )}
        </NewChatModalProvider>
      </SettingsModalProvider>
    </SignUpModalProvider>
  );
};

export default Layout;