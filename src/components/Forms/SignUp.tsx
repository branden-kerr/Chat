import React, { useContext } from 'react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { AuthContext } from '../Authentication/context/authContext';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';

const SignUp: React.FC = () => {

  const { register } = useContext(AuthContext);

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        confirmPassword: '',
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email('Invalid email address')
          .required('Email is required'),
        password: Yup.string()
          .required('Password is required'),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
          .required('Confirm password is required'),
      })}
      onSubmit={async (values: any) => {
        try {
          await register(
            values.email,
            values.password,
          );
        } catch (e: any) {
          toast.error(e.message);
        }
      }}
    >
      <Form style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        height: '80%',
        width: '100%',
        // backgroundColor: 'green',
        position: 'relative',
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
              style={{
                color: 'red',
                marginTop: '0.5rem'
              }}
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
            <ErrorMessage
              name="confirmPassword"
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
