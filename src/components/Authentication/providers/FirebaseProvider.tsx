import React, { createContext, useEffect, useState } from "react";

import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { Firestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

type FirebaseContextType = {
  usingEmulators: boolean;
  emulatorsConfig: any;
  myApp: any;
  myAuth: any;
  myFS: Firestore;
  myStorage: any;
  myRLDB: any;
};

export const FirebaseContext = createContext<FirebaseContextType>({} as FirebaseContextType);


const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

export const FirebaseProvider = (props: any) => {
  const children = props.children;

  const [firebaseInitializing, setFirebaseInitializing] = useState(true);
  const [usingEmulators, setUsingEmulators] = useState(false);
  const [emulatorsConfig, setEmulatorsConfig] = useState(false);

  const myApp = initializeApp(firebaseConfig);
  const myAuth = getAuth(myApp);
  const myFS = getFirestore(myApp);
  const myStorage = getStorage(myApp);
  const myRLDB = getDatabase(myApp);

  const functions = getFunctions(myApp);

  useEffect(() => {
    const shouldUseEmulator = false; // or true :)

    if (shouldUseEmulator) {
      let mapEmulators: any = {};

      let FS_HOST = "localhost";
      let FS_PORT = 5002;

      if (FS_HOST && FS_PORT) {
        connectFirestoreEmulator(myFS, FS_HOST, FS_PORT);
        console.log(`firestore().useEmulator(${FS_HOST}, ${FS_PORT})`);
        mapEmulators.FS_HOST = FS_HOST;
        mapEmulators.FS_PORT = FS_PORT;
      }

      let FUNCTIONS_HOST = "localhost";
      let FUNCTIONS_PORT = 5001;

      if (FUNCTIONS_HOST && FUNCTIONS_PORT) {
        connectFunctionsEmulator(functions, FUNCTIONS_HOST, FUNCTIONS_PORT);

        console.log(`firestore().connectFunctionsEmulator(${FUNCTIONS_HOST}, ${FUNCTIONS_PORT})`);
        mapEmulators.FUNCTIONS_HOST = FS_HOST;
        mapEmulators.FUNCTIONS_PORT = FS_PORT;
      }

      let RTDB_HOST = "localhost";
      let RTDB_PORT = 9000;

      if (RTDB_HOST && RTDB_PORT) {
        connectDatabaseEmulator(myRLDB, RTDB_HOST, 9000);
        console.log(`connectDatabaseEmulator(${RTDB_HOST}, ${RTDB_PORT})`);
        mapEmulators.RTDB_HOST = RTDB_HOST;
        mapEmulators.RTDB_PORT = RTDB_PORT;
      }

      let AUTH_HOST = "localhost";
      let AUTH_PORT = 9099; // or whatever you set the port to in firebase.json
      if (AUTH_HOST && AUTH_PORT) {
        let AUTH_URL = `http://${AUTH_HOST}:${AUTH_PORT}`;
        console.log(
          `connectAuthEmulator(${AUTH_URL}, {disableWarnings: true})`
        );
        //    warns you not to use any real credentials -- we don't need that noise :)
        connectAuthEmulator(myAuth, AUTH_URL, { disableWarnings: true });

        mapEmulators.AUTH_HOST = AUTH_HOST;
        mapEmulators.AUTH_PORT = AUTH_PORT;
        mapEmulators.AUTH_URL = AUTH_URL;
      }

      let STORAGE_HOST = "localhost";
      let STORAGE_PORT = 5004; // or whatever you have it set to in firebase.json
      if (STORAGE_HOST && STORAGE_PORT) {
        console.log(`connectStorageEmulator(${STORAGE_HOST}, ${STORAGE_PORT})`);
        connectStorageEmulator(myStorage, STORAGE_HOST, STORAGE_PORT);

        mapEmulators.STORAGE_HOST = STORAGE_HOST;
        mapEmulators.STORAGE_PORT = STORAGE_PORT;
      }

      setUsingEmulators(true);
      setEmulatorsConfig(mapEmulators);

      console.log(
        "FIREBASE STARTUP: using Firebase emulator:",
        JSON.stringify(mapEmulators, null, 2)
      );
    }

    setFirebaseInitializing(false);
  }, [myAuth, myFS, myStorage, myRLDB]);

  if (firebaseInitializing) {
    return <h1>Loading</h1>;
  }

  const theValues = {
    usingEmulators,
    emulatorsConfig,
    myApp,
    myAuth,
    myFS,
    myRLDB,
    myStorage,
  };

  return (
    <FirebaseContext.Provider value={theValues}>
      {children}
    </FirebaseContext.Provider>
  );
};