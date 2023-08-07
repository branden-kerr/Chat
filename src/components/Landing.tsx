import React, { useEffect, useRef, useState } from 'react';
import { FirebaseContext } from './Authentication/providers/FirebaseProvider';
import blobAnimation from '../svgs/blobAnimation.svg';
import circuits from '../svgs/circuits.svg';
import { AuthContext } from './Authentication/context/authContext';
import CloseIcon from '@mui/icons-material/Close';
import LoginForm from './Forms/LoginForm';
import SignUp from './Forms/SignUp';
import { useContext } from 'react';
import { SignUpModalContext } from '../Contexts/ModalContext';
import { styled } from "@mui/system";

const StyledModal = styled('div')({
  position: 'relative',
  borderRadius: '8px',
  width: '50vh',
  height: '60vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  "&::before": {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `url(${circuits}) center/cover no-repeat`,
    zIndex: -1,
    filter: 'brightness(0.85)'
  }
});

const Landing: React.FC = () => {
  const [activeTab, setActiveTab] = useState('login'); // State to track the active tab (login or signup)
  const modalRef = useRef<HTMLDivElement>(null);
  const signUpModal = useContext(SignUpModalContext);

  if (!signUpModal) {
    throw new Error('SettingsModalContext/SignUpModalContext is undefined, please verify the provider');
  }
  const { isOpen: isSignUpOpen, toggle: toggleSignUp } = signUpModal;


  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        toggleSignUp();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: 'repeat(6, 1fr)',
      }}
    >
      <div
        style={{
          gridColumn: '1 / 4',
          gridRow: '2 / 5',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '0 24px',
        }}
      >
        <h1
          style={{
            fontWeight: 'bold',
            fontSize: '48px',
            textAlign: 'left',
            marginBottom: '24px',
            color: 'white',
          }}
        >
          Connect with your friends
        </h1>
        <h4
          style={{
            fontSize: '24px',
            textAlign: 'left',
            marginBottom: '48px',
            color: 'white',
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </h4>
        <button
          style={{
            backgroundColor: '#FF4081',
            color: 'white',
            fontSize: '18px',
            padding: '12px 24px',
            borderRadius: '30px',
            border: 'none',
          }}
          onClick={toggleSignUp}
        >
          Get Started
        </button>
      </div>
      <svg viewBox="-15 0 150 150"
        style={{
          gridColumn: '4/6',
          gridRow: '2/5',
          width: '100%',
          height: '100%',
        }}
      >
        <image href={blobAnimation} />
      </svg>
      <div
        style={{
          gridColumn: '4 / 7',
          gridRow: '1 / 7',
          backgroundImage: 'url(hero-image.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {isSignUpOpen && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(52, 16, 63, 0.5)',
          }}
        >
          <StyledModal ref={modalRef}>
            <CloseIcon
              style={{
                position: 'absolute',
                top: '5',
                right: '5',
                cursor: 'pointer',
              }}
              onClick={toggleSignUp}
            />
            <div
              style={{
                width: '75%',
                height: '65%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                // backgroundColor: 'red'
              }}
            >
              <div
                style={{
                  borderRadius: '10px',
                  width: '75%',
                  height: '10%',
                  alignSelf: 'center',
                  display: 'flex',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'login' ? '#1877f2' : '#5C53FE',
                    color: 'white',
                    fontWeight: 'bold',
                    width: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%'
                  }}
                  onClick={() => handleTabChange('login')}
                >
                  <span>Login</span>
                </div>
                <div
                  style={{
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'signup' ? '#1877f2' : '#5C53FE',
                    fontWeight: 'bold',
                    width: '50%',
                    display: 'flex',
                    color: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%'
                  }}
                  onClick={() => handleTabChange('signup')}
                >
                  <span>Sign Up</span>
                </div>
              </div>
              {activeTab === 'login' ? (
                <LoginForm />
              ) : (
                <SignUp />
              )}
            </div>
          </StyledModal>
        </div>
      )}
    </div>
  );
};

export default Landing;