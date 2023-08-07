import React, { useContext } from 'react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { FirebaseContext } from '../Authentication/providers/FirebaseProvider';
import { AuthContext } from '../Authentication/context/authContext';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

const LoginForm: React.FC = () => {
  const { login } = useContext(AuthContext);
  const handleLogin = async (values: any) => {
    try {
      await login(values.email, values.password);
    } catch (e: any) {
      toast.error(e.message);
    }
    console.log(values);
  };

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      onSubmit={handleLogin}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email('Invalid email address')
          .required('Email is required'),
        password: Yup.string()
          .required('Password is required'),
      })
      }
    >
      <Form style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '80%',
        width: '100%',
        position: 'relative',
      }}>
        <div >
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
              style={{
                color: 'red',
                marginTop: '0.5rem'
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password"
              style={{
                fontWeight: 'bold'
              }}>
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
            top: 0,
            left: 0
          }}
        >
          Login
        </button>
      </Form>
    </Formik>
  );
};

export default LoginForm