import React, { useContext } from 'react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { FirebaseContext } from '../Authentication/providers/FirebaseProvider';
import { AuthContext } from '../Authentication/context/authContext';

const LoginForm: React.FC = () => {

  const { myFS } = useContext(FirebaseContext);
  const { googleSignIn, login } = useContext(AuthContext);

  const handleLogin = (values: any) => {
    login(values.email, values.password);
    console.log(values);
  };

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      onSubmit={handleLogin}
    >
      <Form style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '300px',
        height: '100%',
        justifyContent: 'space-evenly'
      }}>
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ fontWeight: 'bold' }}>
              Email:
            </label>
            <Field
              type="email"
              name="email"
              id="email"
              required
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #ddd',
                width: '100%',
              }}
            />
            <ErrorMessage
              name="email"
              component="div"
              style={{ color: 'red', marginTop: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
          </div>
          <label htmlFor="password" style={{ fontWeight: 'bold' }}>
            Password:
          </label>
          <Field
            type="password"
            name="password"
            id="password"
            required
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #ddd',
              width: '100%',
            }}
          />
          <ErrorMessage
            name="password"
            component="div"
            style={{ color: 'red', marginTop: '0.5rem' }}
          />
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: '#1877f2',
            color: '#fff',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            justifySelf: 'flex-end',
          }}
        >
          Login
        </button>
      </Form>
    </Formik>
  );
};

export default LoginForm