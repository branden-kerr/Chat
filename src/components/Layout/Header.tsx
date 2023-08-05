import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Authentication/context/authContext';
import { useContext } from 'react';
import { SignUpModalContext } from '../../Contexts/ModalContext';

const headerStyles = {
  gridColumn: '1 / 13',
  gridRow: '1 / 2',
  backgroundColor: '#1F1E2B',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 150px',
};

const logoStyles = {
  marginRight: '15px',
  color: 'white',
  cursor: 'pointer'
};

const Header = () => {
  const { user, logout, profile } = useContext(AuthContext);
  const navigate = useNavigate();
  const signUpModal = useContext(SignUpModalContext);

  const { toggle: toggleSignUp } = signUpModal;

  const handleLogout = async () => {
    await logout();
    navigate('/'); // Navigate to the login page after logout
  };
  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header style={headerStyles}>
      <button style={logoStyles} onClick={handleLogoClick}>
        LOGO
      </button>
      {user ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          color: 'white'
        }}>
          <p style={{
            margin: 0,
            marginRight: '10px'
          }}>
            {profile && profile.firstname !== "" ? `Welcome, ${profile.firstName}` : 'Welcome'}
          </p>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      ) : (
        <div>
          <div
            style={{
              color: 'white'
            }}
          >
            <button
              style={{
                marginRight: '10px',
                textDecoration: 'none'
              }}
              onClick={toggleSignUp}
            >
              Sign Up
            </button>
            <button
              style={{
                textDecoration: 'none'
              }}
              onClick={toggleSignUp}
            >
              Log In
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
