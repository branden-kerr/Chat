import React, { useContext } from "react";
import { AuthContext } from "../Authentication/context/authContext";
import { doc, setDoc } from "firebase/firestore";
import { FirebaseContext } from "../Authentication/providers/FirebaseProvider";
import CloseIcon from '@mui/icons-material/Close';
import { SettingsModalContext } from '../../Contexts/ModalContext';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { getDownloadURL, uploadBytesResumable, ref as storageRef } from "firebase/storage";

const SettingsModal: React.FC = () => {
  const { profile } = useContext(AuthContext);
  const { myFS, myStorage } = useContext(FirebaseContext);
  const { toggle: toggleSettings } = useContext(SettingsModalContext);

  const styles = {
    fieldStyle: {
      width: '100%',
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #ccd0d5'
    },
    settingsFormButtonSave: {
      width: '50%',
      padding: '10px',
      backgroundColor: '#1da1f2',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      marginTop: '10px',
      alignSelf: 'center',
    }
  };

  return (
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
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          position: 'relative',
          borderRadius: '8px',
          backgroundColor: 'rgb(233, 233, 233)',
          padding: '0 30px',
          backdropFilter: 'blur(10px)',
          width: '60vh',
          height: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0px 10px 20px rgba(0,0,0,0.1)',
        }}
      >
        <button
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            fontSize: '1.5rem',
          }}
          onClick={toggleSettings}
        >
          <CloseIcon />
        </button>
        <Formik
          initialValues={{
            username: profile.username || '',
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            displayPicture: profile.displayPicture || '',
          }}
          validationSchema={Yup.object().shape({
            username: Yup.string().required('Username is required'),
            firstName: Yup.string().required('First Name is required'),
            lastName: Yup.string().required('Last Name is required'),
            email: Yup.string().email('Invalid email').required('Email is required'),
            displayPicture: Yup.string().required('Display Picture is required'),
          })}
          onSubmit={async (values, { resetForm, setStatus, setSubmitting }) => {
            let userDocRef = doc(myFS, "users", profile.uid);

            let userDocData: any = {
              email: values.email,
              username: values.username,
              firstName: values.firstName,
              lastName: values.lastName,
            };
            if (values.displayPicture) {
              let storeRef = storageRef(myStorage, 'displayPictures/' + profile.uid);

              let uploadTask = uploadBytesResumable(storeRef, values.displayPicture);

              uploadTask.on('state_changed',
                (snapshot) => {
                },
                (error) => {
                  console.log(error);
                },
                async () => {
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  console.log('File available at', downloadURL);
                  userDocData.displayPicture = downloadURL;
                  try {
                    await setDoc(userDocRef, userDocData, { merge: true });
                  } catch (e) {
                    console.log(e);
                  }
                  toggleSettings();
                }
              );
            }
          }}
        >
          {({ errors, touched, setFieldValue }) => (
            <Form
              style={{
                width: '100%',
                fontFamily: 'Arial, sans-serif',
                display: 'flex',
                flexDirection: 'column',
              }}>
              <div
                style={{
                  marginBottom: '10px'
                }}>
                <label htmlFor="username"
                  style={{
                    fontWeight: 'bold'
                  }}>Username</label>
                <Field style={styles.fieldStyle}
                  type="text"
                  id="username"
                  name="username"
                />
              </div>
              <div
                style={{
                  marginBottom: '10px'
                }}>
                <label
                  htmlFor="firstName"
                  style={{
                    fontWeight: 'bold'
                  }}
                >
                  First Name
                </label>
                <Field style={styles.fieldStyle}
                  type="text"
                  id="firstName"
                  name="firstName"
                />
              </div>
              <div
                style={{
                  marginBottom: '10px'
                }}>
                <label
                  htmlFor="lastName"
                  style={{
                    fontWeight: 'bold'
                  }}
                >
                  Last Name
                </label>
                <Field style={styles.fieldStyle}
                  type="text"
                  id="lastName"
                  name="lastName"
                />
              </div>
              <div
                style={{
                  marginBottom: '10px'
                }}>
                <label
                  htmlFor="email"
                  style={{
                    fontWeight: 'bold'
                  }}
                >
                  Email
                </label>
                <Field style={styles.fieldStyle}
                  type="email"
                  id="email"
                  name="email"
                />
              </div>
              <div
                style={{
                  marginBottom: '10px'
                }}>
                <label
                  htmlFor="displayPicture"
                  style={{
                    fontWeight: 'bold'
                  }}
                >
                  Display Picture
                </label>
                <input  // Use a regular input instead of Field
                  style={styles.fieldStyle}
                  type="file"
                  id="displayPicture"
                  name="displayPicture"
                  onChange={(event) => {
                    if (event.currentTarget.files) {
                      setFieldValue('displayPicture', event.currentTarget.files[0]);
                    }
                  }}
                />
              </div>
              <button
                style={styles.settingsFormButtonSave}
                type="submit"
              >
                Save
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default SettingsModal;

