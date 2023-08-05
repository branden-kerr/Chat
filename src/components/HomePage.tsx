import React from 'react';
import { FirebaseContext } from './Authentication/providers/FirebaseProvider';
import { useContext } from 'react';

const HomePage: React.FC = () => {
  const { myFS } = useContext(FirebaseContext);

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        heello
      </div>
    </>
  );
};

export default HomePage;
