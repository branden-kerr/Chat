import React, { useContext, useEffect, useState } from "react";
import { Conversation, Message } from "../../types";
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import InfiniteScroll from "react-infinite-scroll-component";
import { Spin } from "react-cssfx-loading";
import { AuthContext } from "../Authentication/context/authContext";
import ThemeContext from "../../Theme/ThemeContext";
import SideBarChat from "./SideBarChat";
import ChatInput from "./ChatInput";
import { collection, doc, getDocs, orderBy, query, setDoc, where } from "firebase/firestore";
import { FirebaseContext } from "../Authentication/providers/FirebaseProvider";
import { get, limitToLast, off, onChildAdded, query as rtdbQuery, onChildChanged, onChildRemoved, onValue, push, ref, serverTimestamp, set } from "firebase/database";
import { useLocation } from 'react-router-dom';
import { SettingsModalContext, NewChatModalContext } from '../../Contexts/ModalContext';
import SettingsModal from "../modals/SettingsModal";
import NewChatModal from "../modals/NewChatModal";

interface ChatListProps {
  messages?: Message[];
}

function generateRandomTime(number?: boolean): any {
  const currentTime = new Date();
  const pastTime = faker.date.between(faker.date.recent(), currentTime);

  if (number) {
    return pastTime.getTime();
  }
  const tempDateNumber = new Date(pastTime.getTime());
  return (
    ` ${tempDateNumber.getDay()}/${tempDateNumber.getMonth()}/${tempDateNumber.getFullYear()}/`
  )
}
const ChatList: React.FC<ChatListProps> = ({ messages }) => {
  const [messageCount, setMessageCount] = useState(50);
  const { profile } = useContext(AuthContext);
  const { myFS, myRLDB, myStorage } = useContext(FirebaseContext);
  const theme = useContext(ThemeContext);
  // const [messagesArray, setMessagesArray] = useState<Message[]>([]);
  const endOfMessagesRef = React.useRef<null | HTMLLIElement>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string>();
  const [messagesCache, setMessagesCache] = useState<Record<string, Message[]>>({});
  let messagesArray: Message[] = [];
  const location = useLocation();
  const retrievedUser = location.state?.retrievedUser;
  const [addedToConversations, setAddedToConversations] = useState(false);
  const [gotConversations, setGotConversations] = useState(false);
  const [firstMessage, setFirstMessage] = useState<boolean>(false);
  const { isOpen: isSettingsOpen, toggle: toggleSettings } = useContext(SettingsModalContext);
  const { isOpen: isNewChatOpen, toggle: toggleNewChat } = useContext(NewChatModalContext);

  useEffect(() => {
    if (retrievedUser && !addedToConversations) {
      // Query Firestore for a conversation where otherPersonId is equal to retrievedUser.uid
      const userConversationsRef = collection(myFS, `users/${profile.uid}/conversations`);
      const queryRef = query(userConversationsRef, where("otherPersonId", "==", retrievedUser.uid));

      getDocs(queryRef).then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const existingConversation = querySnapshot.docs[0];
          setSelectedConversation(existingConversation.id);
        } else {
          const newConversation = {
            id: uuidv4(),
            otherPersonId: retrievedUser.uid,
            username: retrievedUser.username,
            lastInteractionTime: Date.now(),
            lastMessage: '',
            displayPicture: retrievedUser.displayPicture
          }
          setConversations([newConversation]);
          setSelectedConversation(newConversation.id);
          setAddedToConversations(true);
          setFirstMessage(true);
        }
      });
    }
  }, [conversations])

  if (selectedConversation !== undefined) {
    messagesArray = messagesCache[selectedConversation] || [];
  }

  useEffect(() => {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messagesArray]);

  const addMessageToConversation = (messageContent: string) => {
    if (selectedConversation && profile?.uid) {
      const newMessageId = uuidv4(); // Generate a new id for the message
      const newMessage: Message = {
        id: newMessageId,
        senderId: profile.uid,
        content: messageContent,
        timeSent: serverTimestamp() as any, // Use Firebase's serverTimestamp function
        type: 'text', // Assuming all messages sent through the input are text
      };

      // Add the new message to the cache
      setMessagesCache(prevCache => ({
        ...prevCache,
        [selectedConversation]: [...(prevCache[selectedConversation] || []), newMessage]
      }));

      // Add the new message to the database
      const messagesRef = ref(myRLDB, `conversations/${selectedConversation}/messages/${newMessageId}`);
      set(messagesRef, newMessage)
        .then(() => {
          // After the message is successfully saved, set up a one-time listener to get the actual timestamp
          get(messagesRef)
            .then((snapshot) => {
              const actualMessage = snapshot.val();

              // Update the cached message with the actual timestamp
              setMessagesCache(prevCache => {
                const updatedMessages = prevCache[selectedConversation]?.map(msg =>
                  msg.id === newMessageId ? { ...msg, timeSent: actualMessage.timeSent } : msg
                );

                return {
                  ...prevCache,
                  [selectedConversation]: updatedMessages
                };
              });

              if (retrievedUser && firstMessage) {
                // Define the new conversation
                const conversation: Conversation = {
                  id: selectedConversation,
                  otherPersonId: retrievedUser.uid,
                  username: retrievedUser.username,
                  lastMessage: newMessage.content,
                  lastInteractionTime: actualMessage.timeSent,
                  displayPicture: retrievedUser.displayPicture,
                };
                const conversationForOther: Conversation = {
                  id: selectedConversation,
                  otherPersonId: profile.uid,
                  username: profile.username,
                  lastMessage: newMessage.content,
                  lastInteractionTime: actualMessage.timeSent,
                  displayPicture: profile.displayPicture,
                };

                // Add the new conversation to both users' documents
                const user1ConversationRef = doc(myFS, 'users', profile.uid, 'conversations', `${conversation.id}_${profile.username}`);
                const user2ConversationRef = doc(myFS, 'users', retrievedUser.uid, 'conversations', `${conversation.id}_${retrievedUser.username}`);

                setFirstMessage(false);

                return Promise.all([
                  setDoc(user1ConversationRef, conversation),
                  setDoc(user2ConversationRef, conversationForOther),
                ]);
              }
            });
        })
        .catch((error) => {
          console.error("Error adding message: ", error);

          // If there's an error, remove the message from the cache
          setMessagesCache(prevCache => {
            const updatedMessages = prevCache[selectedConversation]?.filter(msg => msg.id !== newMessageId);

            return {
              ...prevCache,
              [selectedConversation]: updatedMessages
            };
          });
        });
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      const messagesRef = ref(myRLDB, `conversations/${selectedConversation}/messages`);
      const limitedMessagesRef = rtdbQuery(messagesRef, limitToLast(50)); // Only retrieve the last 50 messages initially

      // Handle new messages.
      const handleNewMessage = (snapshot: any) => {
        const message = snapshot.val();
        const id = snapshot.key;

        setMessagesCache(prevCache => {
          // Get the existing messages for the conversation or an empty array if it's not in the cache.
          const existingMessages = prevCache[selectedConversation] || [];

          // Check if the message already exists in the cache.
          if (existingMessages.some(msg => msg.id === id)) return prevCache;

          return {
            ...prevCache,
            [selectedConversation]: [...existingMessages, { ...message, id }],
          };
        });
      };

      // Handle updated messages.
      const handleUpdatedMessage = (snapshot: any) => {
        const updatedMessage = snapshot.val();
        const id = snapshot.key;

        setMessagesCache(prevCache => {
          // Find the message to update in the cache.
          const existingMessages = prevCache[selectedConversation];
          const messageIndex = existingMessages.findIndex(message => message.id === id);

          if (messageIndex >= 0) {
            // Replace the old message with the updated one.
            const updatedMessages = [...existingMessages];
            updatedMessages[messageIndex] = { ...updatedMessage, id };

            return {
              ...prevCache,
              [selectedConversation]: updatedMessages,
            };
          }

          return prevCache;
        });
      };


      // Handle deleted messages.
      const handleRemovedMessage = (snapshot: any) => {
        const id = snapshot.key;

        setMessagesCache(prevCache => {
          // Find the message to remove in the cache.
          const existingMessages = prevCache[selectedConversation];
          const messageIndex = existingMessages.findIndex(message => message.id === id);

          if (messageIndex >= 0) {
            // Remove the message from the array.
            const updatedMessages = [...existingMessages];
            updatedMessages.splice(messageIndex, 1);

            return {
              ...prevCache,
              [selectedConversation]: updatedMessages,
            };
          }

          return prevCache;
        });
      };

      // Listen for new, updated, and removed messages.
      onChildAdded(limitedMessagesRef, handleNewMessage);
      onChildChanged(messagesRef, handleUpdatedMessage);
      onChildRemoved(messagesRef, handleRemovedMessage);

      return () => {
        off(limitedMessagesRef, 'child_added', handleNewMessage);
        off(messagesRef, 'child_changed', handleUpdatedMessage);
        off(messagesRef, 'child_removed', handleRemovedMessage);
      };
    }
  }, [selectedConversation]);


  useEffect(() => {
    if (profile && profile.uid) {
      const orderedConversationsRef = query(collection(myFS, `users/${profile.uid}/conversations`), orderBy('lastInteractionTime', 'asc'));
      getDocs(orderedConversationsRef)
        .then(async (querySnapshot) => {
          const fetchedConversations = querySnapshot.docs.map(doc => {
            return doc.data() as Conversation;
          });
          if (fetchedConversations.length > 0) {
            alert('true!')
            setConversations(fetchedConversations);
            setSelectedConversation(fetchedConversations[fetchedConversations.length - 1].id);
          }
        })
      setGotConversations(true);
      setLoading(false);
    }
  }, [profile, gotConversations, myFS, selectedConversation]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const loadMoreMessages = () => {
    setMessageCount((prevCount) => prevCount + 50);
  };

  const styles = {
    ChatViewContainer: {
      width: '100%',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gridTemplateRows: '100%'
    } as React.CSSProperties,
    InfiniteScroll: {
      backgroundColor: theme.colors.secondary,
      width: '100%',
    } as React.CSSProperties,
    messageDivContainer: {
      display: 'flex',
      margin: '10px',
      flexDirection: 'column'
    } as React.CSSProperties,
    message: {
      borderRadius: '10%',
      padding: '5px',
      marginTop: '10px',
      marginBottom: '10px',
    } as React.CSSProperties,
    sentMessage: {
      backgroundColor: theme.colors.tertiary,
      alignSelf: 'flex-end'
    } as React.CSSProperties,
    receivedMessage: {
      backgroundColor: theme.colors.primary,
      alignSelf: 'flex-start'
    } as React.CSSProperties,
  };

  return (
    <>
      <div
        style={styles.ChatViewContainer}
      >
        <SideBarChat
          conversations={conversations}
          onClick={setSelectedConversation}
          selectedConversation={selectedConversation || ''}
          retrievedUser={retrievedUser}

        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gridColumn: '3 / 7',
          }}
        >
          <div
            style={{
              height: '80%',
              overflowY: 'scroll',
            }}
            id='message-container'
          >
            <InfiniteScroll
              dataLength={messageCount}
              next={loadMoreMessages}
              inverse
              hasMore={true}
              loader={
                firstMessage ? (
                  <div className="flex justify-center py-3">
                    Send your first message to {retrievedUser?.username}
                  </div>
                ) : (
                  <div className="flex justify-center py-3">
                    <Spin />
                  </div>
                )
              }
            >
              {messagesArray.length > 0 && messagesArray.map((item, index) => {
                return (
                  item.senderId === profile?.uid ? (
                    <div
                      style={styles.messageDivContainer}
                    >
                      <span style={{
                        ...styles.message, ...styles.sentMessage,
                      }}
                      >
                        {item.content}
                      </span>
                    </div>
                  ) : (
                    <div
                      style={styles.messageDivContainer}
                    >
                      <span
                        style={{
                          ...styles.message, ...styles.receivedMessage,
                        }}
                      >
                        {item.content}
                      </span>
                    </div>
                  )
                )
              })}
            </InfiniteScroll>
          </div>
          <ChatInput
            selectedConversation={selectedConversation || ''}
            addMessage={addMessageToConversation}
          />
        </div>
      </div>
      {isSettingsOpen && (
        <SettingsModal />
      )}
      {
        isNewChatOpen && (
          <NewChatModal setSelectedConversation={setSelectedConversation} />
        )
      }
    </>
  );
};

export default ChatList;
