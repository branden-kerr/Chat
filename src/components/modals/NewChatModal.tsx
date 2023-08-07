import React, { useContext, useState } from "react";
import { AuthContext } from "../Authentication/context/authContext";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import CloseIcon from '@mui/icons-material/Close';
import { NewChatModalContext } from '../../Contexts/ModalContext';
import { Conversation, User } from '../../types';
import { FirebaseContext } from "../Authentication/providers/FirebaseProvider";
import dummyConversationData from "../../data/dummyConversationData";
import { v4 as uuidv4 } from 'uuid';
import { styled } from '@mui/system';

const StyledConversationItem = styled('div')<{ isActive: boolean }>(
  ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: isActive ? '#1e517a' : 'transparent',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#1e517a',
      '& > div': {
        color: 'white',
      },
    }
  })
);
const UserFirstNameLastNameSpan = styled('div')<{ isActive: boolean }>(
  ({ isActive }) => ({
    color: isActive ? 'white' : 'initial',
  }));

interface NewChatModalProps {
  setSelectedConversation: (conversation: string) => void;
  setGotConversations: (gotConversations: boolean) => void;
  conversations: Conversation[] | undefined;
  users: Partial<User>[];
}

const NewChatModal: React.FC<NewChatModalProps> = (props) => {
  const { profile } = useContext(AuthContext);
  const { myFS } = useContext(FirebaseContext);
  const { toggle: toggleNewChat } = useContext(NewChatModalContext);
  const [selectedPerson, setSelectedPerson] = useState<Conversation | null>(null);
  const { setSelectedConversation, setGotConversations, users, conversations } = props;
  const [activeTab, setActiveTab] = useState<string>('generic');

  const handlePersonSelect = (person: Conversation) => {
    setSelectedPerson(person);
  };

  const handleConversationInitiate = async (isNewUser: boolean) => {
    if (selectedPerson) {
      if (conversations
        && conversations.length > 0
        && conversations?.findIndex((conversation) => conversation.otherPersonId !== selectedPerson.otherPersonId) === -1
      ) {
        toggleNewChat();
        return setSelectedConversation(selectedPerson.id);
      }
      const newConversationID = uuidv4();
      const lastInteractionTime = new Date();

      const conversationData: Conversation = {
        id: newConversationID,
        otherPersonId: selectedPerson.otherPersonId,
        username: selectedPerson.username,
        firstName: selectedPerson.firstName,
        lastName: selectedPerson.lastName,
        lastInteractionTime: lastInteractionTime,
        displayPicture: selectedPerson.displayPicture,
      };
      const conversationsRef = doc(myFS, `users/${profile.uid}/conversations/${newConversationID}`);
      if (isNewUser) {
        const otherPersonConversationRef = doc(myFS, `users/${selectedPerson.otherPersonId}/conversations/${newConversationID}`);
        await setDoc(otherPersonConversationRef, conversationData);
      }
      await setDoc(conversationsRef, conversationData)
      setSelectedConversation(newConversationID);
      setGotConversations(false);
      toggleNewChat();
    }
  };

  return (
    <>
      <div
        style={{
          borderRadius: '10px',
          width: '60%',
          height: '7%',
          alignSelf: 'center',
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        <div
          onClick={() => {
            setActiveTab('generic')
          }}
          style={{
            cursor: 'pointer',
            color: 'white',
            fontWeight: 'bold',
            width: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            backgroundColor: activeTab === 'generic' ? '#1877f2' : '#5C53FE',
          }}
        >
          <span>
            Generic
          </span>
        </div>
        <div
          onClick={() => {
            setActiveTab('real-users')
          }}
          style={{
            cursor: 'pointer',
            color: 'white',
            fontWeight: 'bold',
            width: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            backgroundColor: activeTab === 'real-users' ? '#1877f2' : '#5C53FE',
          }}
        >
          <span>
            Real Users
          </span>
        </div>
      </div>
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
      <div
        style={{
          maxHeight: '60%',
          width: '90%',
          height: '70%',
          overflow: 'auto',
          margin: '20px 0',
          borderRadius: '7px',
          backgroundColor: '#b8b8b8',
        }}
      >
        {activeTab === 'generic' ? (
          dummyConversationData.map((person) => (
            <StyledConversationItem
              isActive={selectedPerson?.id === person.id}
              onClick={() => handlePersonSelect(person)}
            >
              <img
                src={person.displayPicture}
                alt="Profile"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  marginRight: '10px'
                }}
              />
              <UserFirstNameLastNameSpan
                isActive={selectedPerson?.id === person.id}
              >
                {`${person.firstName} ${person.lastName}`}
              </UserFirstNameLastNameSpan>
            </StyledConversationItem >
          ))
        ) : (
          users && users.length > 0 ? (
            users.map((user) => (
              user && user.uid !== profile.uid &&
              <StyledConversationItem
                key={user.uid}
                isActive={selectedPerson?.id === user.uid}
                onClick={() => {
                  handlePersonSelect({
                    id: user.uid as string,
                    otherPersonId: user.uid as string,
                    username: user.username as string,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    displayPicture: user.displayPicture as string,
                  } as Conversation)
                }}
              >
                <img
                  src={user.displayPicture}
                  alt="Profile"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    marginRight: '10px'
                  }}
                />
                <UserFirstNameLastNameSpan
                  isActive={selectedPerson?.id === user.uid}
                >
                  {user.firstName !== '' && user.lastName !== '' ?
                    `${user.firstName} ${user.lastName}`
                    :
                    <em>
                      Info not set by user
                    </em>
                  }

                </UserFirstNameLastNameSpan>
              </StyledConversationItem>
            ))
          ) : (
            <div>
              Not enough users to show
            </div>
          )
        )}

      </div >
      <button
        style={{
          padding: '12px 24px',
          borderRadius: '4px',
          backgroundColor: '#1877f2',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          width: 'fit-content',
          alignSelf: 'center',
          fontSize: '1rem',
          transition: 'background-color 0.3s',
        }}
        onClick={() => {
          handleConversationInitiate(activeTab === 'real-users');
        }}
        onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#165dbb'}
        onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#1877f2'}
      >
        Initiate Conversation
      </button>
    </>
  );
};

export default NewChatModal;