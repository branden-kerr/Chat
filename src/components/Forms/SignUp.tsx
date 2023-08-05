import React, { useContext } from 'react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { FirebaseContext } from '../Authentication/providers/FirebaseProvider';
import { AuthContext } from '../Authentication/context/authContext';
import { doc, setDoc } from 'firebase/firestore';
import { User } from '../../types/user';
import { faker } from '@faker-js/faker';

const SignUp: React.FC = () => {

  const { myFS, } = useContext(FirebaseContext);
  const { googleSignIn, register } = useContext(AuthContext);


  const handleSignup = async (values: any) => {
    await register(
      values.email,
      values.password,
    );
  };

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        firstName: '',
        lastName: '',
      }}

      onSubmit={handleSignup}
    >
      <Form style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
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
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="confirmPassword" style={{ fontWeight: 'bold' }}>
            Confirm Password:
          </label>
          <Field
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            required
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #ddd',
              width: '100%',
            }}
          />
          {/* <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="username" style={{ fontWeight: 'bold' }}>
              Username:
            </label>
            <Field
              type="text"
              name="username"
              id="username"
              required
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #ddd',
                width: '100%',
              }}
            />
            <ErrorMessage
              name="username"
              component="div"
              style={{ color: 'red', marginTop: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="firstName" style={{ fontWeight: 'bold' }}>
              First Name:
            </label>
            <Field
              type="text"
              name="firstName"
              id="firstName"
              required
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #ddd',
                width: '100%',
              }}
            />
            <ErrorMessage
              name="firstName"
              component="div"
              style={{ color: 'red', marginTop: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="lastName" style={{ fontWeight: 'bold' }}>
              Last Name:
            </label>
            <Field
              type="text"
              name="lastName"
              id="lastName"
              required
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #ddd',
                width: '100%',
              }}
            />

            <ErrorMessage
              name="confirmPassword"
              component="div"
              style={{ color: 'red', marginTop: '0.5rem' }}
            />
          </div> */}
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
          }}
        >
          Sign Up
        </button>
      </Form>
    </Formik>
  );
};

export default SignUp;

function uuid() {
  throw new Error('Function not implemented.');
}
