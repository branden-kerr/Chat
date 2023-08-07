import React, { createContext, useContext, useEffect, useState } from "react";
import { faker } from '@faker-js/faker';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { FirebaseContext } from "../providers/FirebaseProvider";
import { User } from '../../../types';
import LoadingSpinner from "../../LoadingSpinner";
// Generate dummy data EMULATOR

type AuthContextType = {
  user: User;
  authLoading: boolean;
  authErrorMessage: any;
  profile: any;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  register: (
    email: string,
    password: string,
  ) => Promise<boolean>;
  googleSignIn: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const PROFILE_COLLECTION = "users"; // name of the FS collection of user profile docs

export const AuthProvider = (props: any) => {
  const children = props.children;
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authErrorMessage, setAuthErrorMessage] = useState<any>();

  const { myAuth, myFS }: any = useContext(FirebaseContext);

  const registerFunction = async (
    email: string,
    password: string,
  ) => {
    try {
      let userCredential = await createUserWithEmailAndPassword(
        myAuth,
        email,
        password
      );
      let user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      let userDocRef = doc(myFS, "users", user.uid);
      let userDocData: User = {
        uid: user.uid,
        email: email,
        username: '',
        firstName: '',
        lastName: '',
        emailVerified: false,
        dateCreated: serverTimestamp(),
        displayPicture: faker.image.avatar(),
      };
      try {
        await setDoc(userDocRef, userDocData);
      } catch (e) {
        alert(JSON.stringify(e));
      }

      return true;
    } catch (ex: any) {
      console.error(`registerFunction() failed with: ${ex.message}`);
      setAuthErrorMessage(ex.message);
      let userFriendlyMessage;
      switch (ex.code) {
        case 'auth/email-already-in-use':
          userFriendlyMessage = 'Oops, looks like someone else already has that email.';
          break;
        case 'auth/invalid-email':
          userFriendlyMessage = 'The email address is not valid.';
          break;
        default:
          userFriendlyMessage = 'An unexpected error occurred. Please try again later.';
      }
      throw new Error(userFriendlyMessage);
    }
  };

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(myAuth, provider);
      const user = userCredential.user;
      setUser(user);
    } catch (ex: any) {
      console.error(`Google sign-in failed with error: ${ex.message}`);
      setAuthErrorMessage(ex.message);
    }
  };

  const loginFunction = async (email: string, password: string) => {
    try {
      let userCredential = await signInWithEmailAndPassword(
        myAuth,
        email,
        password
      );
      let user = userCredential.user;
      if (!user?.uid) {
        let msg = `No UID found after signIn!`;
        console.error(msg);
      }
      if (user) {
        console.log(`Logged in as uid(${user.uid}) email(${user.email})`);
      }
      setUser(user);
      return true;
    } catch (ex: any) {
      console.error(`signInFunction() failed with: ${ex.message}`);
      setAuthErrorMessage(ex.message);
      let userFriendlyMessage;
      switch (ex.code) {
        case 'auth/user-not-found':
          userFriendlyMessage = 'The email address is not registered.';
          break;
        case 'auth/wrong-password':
          userFriendlyMessage = 'The password is incorrect.';
          break;
        case 'auth/invalid-email':
          userFriendlyMessage = 'The email address is not valid.';
          break;
        default:
          userFriendlyMessage = 'An unexpected error occurred. Please try again later.';
      }
      throw new Error(userFriendlyMessage);
    }
  };

  const logoutFunction = async () => {
    try {
      setUser(null); // shut down the listeners
      await signOut(myAuth);
      console.log("Signed Out");
      return true;
    } catch (ex: any) {
      console.error(ex);
      setAuthErrorMessage(ex.message);
      return false;
    }
  };

  // hook into Firebase Authentication
  useEffect(() => {
    if (myAuth) {
      let unsubscribe = onAuthStateChanged(myAuth, (user) => {
        // if user is null, then we force them to login
        console.log("onAuthStateChanged(): got user", user);
        if (user) {
          setUser(user);
        }

        if (!user?.emailVerified) {
          console.log('Please verify your email address')
        } else {
          console.log("user is verified")
        }

        setAuthLoading(false);
      });

      return unsubscribe;
    }
  }, [myAuth, profile]);

  // listen to the user profile (FS User doc)
  useEffect(() => {
    let unsubscribe: any = null;
    const listenToUserDoc = async (uid: any) => {
      try {
        let docRef = doc(myFS, PROFILE_COLLECTION, uid);
        unsubscribe = await onSnapshot(docRef, (docSnap) => {
          let profileData: any = docSnap.data();
          console.log("Got user profile:", profileData);
          if (!profileData) {
            setAuthErrorMessage(
              `No profile doc found in Firestore at: ${docRef.path}`
            );
          }
          setProfile(profileData);
        });
      } catch (ex: any) {
        console.error(`useEffect() failed with: ${ex.message}`);
        setAuthErrorMessage(ex.message);
      }
    };

    if (user?.uid) {
      listenToUserDoc(user.uid);

      return () => {
        unsubscribe && unsubscribe();
      };
    } else if (!user) {
      setAuthLoading(true);
      setProfile(null);
      setAuthErrorMessage(null);
    }
  }, [user, setProfile, myFS]);

  if (authLoading) {
    return <LoadingSpinner />;
  }

  const theValues = {
    authErrorMessage,
    authLoading,
    profile,
    user,
    login: loginFunction,
    logout: logoutFunction,
    register: registerFunction,
    googleSignIn,
  };

  return (
    <AuthContext.Provider value={theValues}>{children}</AuthContext.Provider>
  );
};