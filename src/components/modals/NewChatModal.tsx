import React, { useContext, useState } from "react";
import { AuthContext } from "../Authentication/context/authContext";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import CloseIcon from '@mui/icons-material/Close';
import { NewChatModalContext } from '../../Contexts/ModalContext';
import { Conversation } from '../../types';
import { FirebaseContext } from "../Authentication/providers/FirebaseProvider";
import dummyConversationData from "../../data/dummyConversationData";
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { set } from "firebase/database";

interface NewChatModalProps {
  setSelectedConversation: (conversation: string) => void;
  setGotConversations: (gotConversations: boolean) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = (props) => {
  const { profile } = useContext(AuthContext);
  const { myFS } = useContext(FirebaseContext);
  const { toggle: toggleNewChat } = useContext(NewChatModalContext);
  const [selectedPerson, setSelectedPerson] = useState<Conversation | null>(null);
  const { setSelectedConversation, setGotConversations } = props;

  const handlePersonSelect = (person: Conversation) => {
    setSelectedPerson(person);
  };

  const handleConversationInitiate = async () => {
    if (selectedPerson) {
      const newConversationID = uuidv4();
      const conversationData: Conversation = {
        id: newConversationID,
        otherPersonId: selectedPerson.otherPersonId,
        username: selectedPerson.username,
        firstName: selectedPerson.firstName,
        lastName: selectedPerson.lastName,
        lastInteractionTime: new Date(),
        displayPicture: selectedPerson.displayPicture,
      };
      const conversationsRef = doc(myFS, `users/${profile.uid}/conversations/${newConversationID}`);
      await setDoc(conversationsRef, conversationData)
        .then(() => {
          setSelectedConversation(newConversationID);
          setGotConversations(false);
          toggleNewChat();
        })
        .catch((error: any) => {
          console.error("Error creating conversation:", error);
        });
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
        backgroundColor: 'rgba(52, 16, 63, 0.75)',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          position: 'relative',
          borderRadius: '15px',
          backgroundColor: '#f8f8f8',
          padding: '30px',
          backdropFilter: 'blur(10px)',
          width: '60vh',
          height: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0px 10px 20px rgba(0,0,0,0.2)',
        }}
      >
        <button
          style={{
            position: 'absolute',
            top: '10px',
            right: '15px',
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            fontSize: '1.5rem',
          }}
          onClick={toggleNewChat}
        >
          <CloseIcon />
        </button>
        <div style={{
          overflow: 'auto',
          padding: '10px',
          maxHeight: '90%',
          width: '90%',
          boxSizing: 'border-box',

        }}>
          {dummyConversationData.map((person) => (
            <div
              key={person.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: selectedPerson?.id === person.id ? '#e1e1e1' : 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => handlePersonSelect(person)}
            >
              <img
                src={person.displayPicture}
                alt="Profile"
                style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
              />
              <div>
                <p>{`${person.firstName} ${person.lastName}`}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          style={{
            padding: '12px 24px',
            borderRadius: '4px',
            backgroundColor: '#1877f2',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'background-color 0.3s',
          }}
          onClick={handleConversationInitiate}
          onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#165dbb'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#1877f2'}
        >
          Initiate Conversation
        </button>
      </div>
    </div>
  );
};

export default NewChatModal;