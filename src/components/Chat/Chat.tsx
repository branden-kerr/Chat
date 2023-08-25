import React, { useContext, useEffect, useState } from "react";
import { Conversation, Message, User } from "../../types";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
import InfiniteScroll from "react-infinite-scroll-component";
import { Spin } from "react-cssfx-loading";
import { AuthContext } from "../Authentication/context/authContext";
import ThemeContext from "../../Theme/ThemeContext";
import SideBarChat from "./SideBarChat";
import ChatInput from "./ChatInput";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  get,
  limitToLast,
  off,
  onChildAdded,
  query as rtdbQuery,
  onChildChanged,
  onChildRemoved,
  ref,
  serverTimestamp,
  set,
  orderByChild,
  update,
} from "firebase/database";
import { FirebaseContext } from "../Authentication/providers/FirebaseProvider";
import { useLocation } from "react-router-dom";
import {
  SettingsModalContext,
  NewChatModalContext,
} from "../../Contexts/ModalContext";
import SettingsModal from "../modals/SettingsModal";
import NewChatModal from "../modals/NewChatModal";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/system";

interface ChatListProps {
  messages?: Message[];
}

const MessageContainer = styled("div")({
  display: "inline-flex",
  alignItems: "center",
  maxWidth: "60%",
  alignSelf: "flex-end",
  position: "relative",
  "&:hover .delete-icon": {
    opacity: 1,
    transform: "scale(1)",
  },
});

const StyledDeleteIcon = styled(DeleteIcon)({
  cursor: "pointer",
  marginRight: "5px",
  color: "#9e9e9e",
  fontSize: "20px",
  opacity: 0,
  transition: "opacity 0.2s, transform 0.2s",
});

const ModalOverlay = styled("div")({
  position: "fixed",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(52, 16, 63, 0.5)",
  transition: "all 0.3s ease",
});

const ModalContainer = styled("div")({
  position: "relative",
  borderRadius: "8px",
  backgroundColor: "rgb(233, 233, 233)",
  padding: "0 30px",
  backdropFilter: "blur(10px)",
  width: "60vh",
  height: "60vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  backgroundPosition: "center",
  boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
});

const NoMessagesYet = styled("span")({
  color: "white",
  marginTop: "8%",
  "@media (max-width: 703px)": {
    width: "75%",
    margin: "8% auto",
    backgroundColor: "red",
    display: "none",
  },
});

const ChatList: React.FC<ChatListProps> = () => {
  const [messageCount, setMessageCount] = useState(50);
  const { profile } = useContext(AuthContext);
  const { myFS, myRLDB, myStorage } = useContext(FirebaseContext);
  const theme = useContext(ThemeContext);
  // const [messagesArray, setMessagesArray] = useState<Message[]>([]);
  const endOfMessagesRef = React.useRef<null | HTMLLIElement>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string>();
  const [messagesCache, setMessagesCache] = useState<Record<string, Message[]>>(
    {}
  );
  let messagesArray: Message[] | undefined = undefined;
  const location = useLocation();
  const retrievedUser = location.state?.retrievedUser;
  const [addedToConversations, setAddedToConversations] = useState(false);
  const [gotConversations, setGotConversations] = useState(false);
  const [firstMessage, setFirstMessage] = useState<boolean>(false);
  const { isOpen: isSettingsOpen, toggle: toggleSettings } =
    useContext(SettingsModalContext);
  const { isOpen: isNewChatOpen, toggle: toggleNewChat } =
    useContext(NewChatModalContext);
  const [users, setUsers] = useState<Partial<User>[]>([]);

  useEffect(() => {
    if (profile && profile.uid && !gotConversations) {
      const unsubscribe = onSnapshot(
        query(
          collection(myFS, `users/${profile.uid}/conversations`),
          orderBy("lastInteractionTime", "asc")
        ),
        async (snapshot) => {
          setLoading(false);

          const newConversations: Conversation[] = [];
          await Promise.all(
            snapshot.docChanges().map(async (change) => {
              if (change.type === "added") {
                const newConversation = change.doc.data() as Conversation;

                if (!gotConversations) {
                  const messagesRef = ref(
                    myRLDB,
                    `conversations/${newConversation.id}/messages`
                  );
                  const limitedMessagesRef = rtdbQuery(
                    messagesRef,
                    orderByChild("timeSent"),
                    limitToLast(1)
                  );
                  const messagesSnapshot = await get(limitedMessagesRef);
                  const message = messagesSnapshot.val() || {};

                  if (messagesSnapshot.exists()) {
                    const messageValue = Object.values(message)[0] as Message;
                    const conversationFirestoreRef = doc(
                      myFS,
                      `users/${profile.uid}/conversations/${newConversation.id}`
                    );
                    await updateDoc(conversationFirestoreRef, {
                      lastInteractionTime: messageValue.timeSent,
                      lastMessage: messageValue.content
                        ? messageValue.content
                        : "",
                    });
                    newConversation.lastInteractionTime = messageValue.timeSent;
                    newConversation.lastMessage = messageValue.content
                      ? messageValue.content
                      : "";
                  } else {
                    newConversation.lastInteractionTime = new Date();
                    newConversation.lastMessage = "";
                  }
                  newConversations.push(newConversation);
                }
              }
            })
          );
          setConversations((prevConversations) => [
            ...prevConversations,
            ...newConversations,
          ]);
          setGotConversations(true);
        }
      );

      return () => {
        unsubscribe();
      };
    }
  }, [profile]);

  // Gets all users. This being a small app, getting all is okay
  useEffect(() => {
    (async () => {
      const usersRef = collection(myFS, "users");
      const usersSnapshot = await getDocs(usersRef);
      const usersData = usersSnapshot.docs.map((doc) => doc.data() as User);
      setUsers(usersData.map(({ emailVerified, email, ...rest }) => rest));
    })();
  }, []);

  if (selectedConversation !== undefined) {
    messagesArray = messagesCache[selectedConversation] || [];
  }

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messagesArray]);

  const addMessageToConversation = (messageContent: string) => {
    if (selectedConversation && profile?.uid) {
      const newMessageId = uuidv4();
      const newMessage: Message = {
        id: newMessageId,
        senderId: profile.uid,
        content: messageContent,
        timeSent: serverTimestamp() as any,
        type: "text",
      };
      setMessagesCache((prevCache) => ({
        ...prevCache,
        [selectedConversation]: [
          ...(prevCache[selectedConversation] || []),
          newMessage,
        ],
      }));
      const messagesRef = ref(
        myRLDB,
        `conversations/${selectedConversation}/messages/${newMessageId}`
      );
      set(messagesRef, newMessage)
        .then(() => {
          get(messagesRef).then((snapshot) => {
            const actualMessage = snapshot.val();
            setMessagesCache((prevCache) => {
              const updatedMessages = prevCache[selectedConversation]?.map(
                (msg) =>
                  msg.id === newMessageId
                    ? { ...msg, timeSent: actualMessage.timeSent }
                    : msg
              );
              return {
                ...prevCache,
                [selectedConversation]: updatedMessages,
              };
            });
            // Locally changes conversations to reflect the lastInteractionTime and lastMessage
            const ConversationToUpdate = conversations.findIndex(
              (conversation) => conversation.id === selectedConversation
            );
            setConversations((prevConversations) => {
              const updatedConversation = {
                ...prevConversations[ConversationToUpdate],
              };
              updatedConversation.lastMessage = actualMessage.content;
              updatedConversation.lastInteractionTime = actualMessage.timeSent;
              const updatedConversations = [...prevConversations];
              updatedConversations.splice(ConversationToUpdate, 1);
              updatedConversations.push(updatedConversation);
              return updatedConversations;
            });

            if (retrievedUser && !firstMessage) {
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
              const user1ConversationRef = doc(
                myFS,
                "users",
                profile.uid,
                "conversations",
                `${conversation.id}_${profile.username}`
              );
              const user2ConversationRef = doc(
                myFS,
                "users",
                retrievedUser.uid,
                "conversations",
                `${conversation.id}_${retrievedUser.username}`
              );
              setFirstMessage(true);
              return Promise.all([
                setDoc(user1ConversationRef, conversation),
                setDoc(user2ConversationRef, conversationForOther),
              ]);
            }
          });
        })
        .catch((error) => {
          console.error("Error adding message: ", error);
          setMessagesCache((prevCache) => {
            const updatedMessages = prevCache[selectedConversation]?.filter(
              (msg) => msg.id !== newMessageId
            );
            return {
              ...prevCache,
              [selectedConversation]: updatedMessages,
            };
          });
        });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (selectedConversation) {
      const updatedMessages =
        messagesCache[selectedConversation]?.filter(
          (msg) => msg.id !== messageId
        ) || [];
      const messageToDelete = messagesCache[selectedConversation]?.find(
        (msg) => msg.id === messageId
      );

      setMessagesCache((prevCache) => ({
        ...prevCache,
        [selectedConversation]: updatedMessages,
      }));

      const messageRef = ref(
        myRLDB,
        `conversations/${selectedConversation}/messages/${messageId}`
      );
      set(messageRef, null).catch((error) => {
        console.error("Error deleting message: ", error);

        setMessagesCache((prevCache) => {
          const prevMessages = prevCache[selectedConversation] || [];
          const messageIndex = prevMessages.findIndex(
            (msg) => msg.id === messageId
          );

          if (messageIndex >= 0 && messageToDelete) {
            const updatedMessages = [
              ...prevMessages.slice(0, messageIndex),
              messageToDelete,
              ...prevMessages.slice(messageIndex),
            ];

            return {
              ...prevCache,
              [selectedConversation]: updatedMessages,
            };
          }

          return prevCache;
        });
      });

      // Locally changes conversations to reflect the lastInteractionTime and lastMessage
      const conversationToUpdateIndex = conversations.findIndex(
        (conversation) => conversation.id === selectedConversation
      );
      const lastMessage = updatedMessages[updatedMessages.length - 1];

      setConversations((prevConversations) => {
        const updatedConversation = {
          ...prevConversations[conversationToUpdateIndex],
        };
        updatedConversation.lastMessage = lastMessage
          ? lastMessage.content
          : "";
        updatedConversation.lastInteractionTime = lastMessage
          ? lastMessage.timeSent
          : updatedConversation.lastInteractionTime;
        const updatedConversations = [...prevConversations];
        updatedConversations[conversationToUpdateIndex] = updatedConversation;
        return updatedConversations;
      });
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      const messagesRef = ref(
        myRLDB,
        `conversations/${selectedConversation}/messages`
      );
      const limitedMessagesRef = rtdbQuery(
        messagesRef,
        orderByChild("timeSent"),
        limitToLast(50)
      );

      const handleNewMessage = (snapshot: any) => {
        const message = snapshot.val();
        const id = snapshot.key;
        setMessagesCache((prevCache) => {
          const existingMessages = prevCache[selectedConversation] || [];

          if (existingMessages.some((msg) => msg.id === id)) return prevCache;

          return {
            ...prevCache,
            [selectedConversation]: [...existingMessages, { ...message, id }],
          };
        });
      };

      const handleUpdatedMessage = (snapshot: any) => {
        const updatedMessage = snapshot.val();
        const id = snapshot.key;

        setMessagesCache((prevCache) => {
          const existingMessages = prevCache[selectedConversation];
          const messageIndex = existingMessages.findIndex(
            (message) => message.id === id
          );

          if (messageIndex >= 0) {
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

      const handleRemovedMessage = (snapshot: any) => {
        const id = snapshot.key;

        setMessagesCache((prevCache) => {
          // Find the message to remove in the cache.
          const existingMessages = prevCache[selectedConversation];
          const messageIndex = existingMessages.findIndex(
            (message) => message.id === id
          );

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
        off(limitedMessagesRef, "child_added", handleNewMessage);
        off(messagesRef, "child_changed", handleUpdatedMessage);
        off(messagesRef, "child_removed", handleRemovedMessage);
      };
    }
  }, [selectedConversation]);

  // useEffect(() => {
  //   if (profile && profile.uid && !gotConversations) {
  //     try {
  //       const orderedConversationsRef = query(collection(myFS, `users/${profile.uid}/conversations`), orderBy('lastInteractionTime', 'asc'));
  //       getDocs(orderedConversationsRef)
  //         .then(async (querySnapshot) => {
  //           const fetchedConversations = querySnapshot.docs.map(doc => {
  //             return doc.data() as Conversation;
  //           });

  //           const newFetchedConversations = await Promise.all(
  //             fetchedConversations.map(async (conversation) => {
  //               const newConversation = { ...conversation };
  //               const messagesRef = ref(myRLDB, `conversations/${conversation.id}/messages`);
  //               const limitedMessagesRef = rtdbQuery(messagesRef, orderByChild('timeSent'), limitToLast(1));
  //               const messagesSnapshot = await get(limitedMessagesRef);
  //               const message = messagesSnapshot.val() || {};

  //               if (messagesSnapshot.exists()) {
  //                 const messageValue = Object.values(message)[0] as Message;
  //                 const conversationFirestoreRef = doc(myFS, `users/${profile.uid}/conversations/${conversation.id}`);
  //                 await updateDoc(conversationFirestoreRef, {
  //                   lastInteractionTime: messageValue.timeSent,
  //                   lastMessage: messageValue.content ? messageValue.content : '',
  //                 });

  //                 newConversation.lastInteractionTime = messageValue.timeSent;
  //                 newConversation.lastMessage = messageValue.content ? messageValue.content : '';
  //               } else {
  //                 newConversation.lastInteractionTime = new Date();
  //                 newConversation.lastMessage = '';
  //               }

  //               return newConversation;
  //             })
  //           );

  //           if (newFetchedConversations.length > 0) {
  //             setConversations(newFetchedConversations);
  //             if (!selectedConversation) {
  //               setSelectedConversation(newFetchedConversations[0].id);
  //             }
  //           }
  //         });
  //     } catch (e) {
  //       console.log(e);
  //     }
  //     setGotConversations(true);
  //     setLoading(false);
  //   }
  // }, [profile, gotConversations, myFS, selectedConversation]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const loadMoreMessages = () => {
    setMessageCount((prevCount) => prevCount + 50);
  };

  const styles = {
    ChatViewContainer: {
      width: "100%",
      height: "100%",
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gridTemplateRows: "100%",
    } as React.CSSProperties,
    InfiniteScroll: {
      backgroundColor: theme.colors.secondary,
      width: "100%",
    } as React.CSSProperties,
    messageDivContainer: {
      display: "flex",
      margin: "10px",
      flexDirection: "column",
    } as React.CSSProperties,
    message: {
      borderRadius: "10px",
      padding: "5px",
      marginTop: "10px",
      maxWidth: "60%",
      marginBottom: "10px",
    } as React.CSSProperties,
    sentMessage: {
      backgroundColor: theme.colors.tertiary,
    } as React.CSSProperties,
    receivedMessage: {
      backgroundColor: theme.colors.primary,
      alignSelf: "flex-start",
    } as React.CSSProperties,
  };

  return (
    <>
      <div style={styles.ChatViewContainer}>
        <SideBarChat
          conversations={conversations}
          onClick={setSelectedConversation}
          selectedConversation={selectedConversation || ""}
          retrievedUser={retrievedUser}
          setConversations={setConversations}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gridColumn: "3 / 7",
          }}
        >
          <div
            style={{
              height: "80%",
              overflowY: "scroll",
            }}
            id="message-container"
          >
            <InfiniteScroll
              dataLength={messageCount}
              next={loadMoreMessages}
              inverse
              hasMore={true}
              loader={
                !firstMessage ? (
                  <NoMessagesYet className="flex justify-center py-3">
                    No messages yet. Send a message to start a conversation.
                  </NoMessagesYet>
                ) : (
                  <div className="flex justify-center py-3">
                    <Spin />
                  </div>
                )
              }
            >
              {messagesArray &&
                messagesArray.length > 0 &&
                messagesArray.map((item, index) => {
                  return item.senderId === profile?.uid ? (
                    <div style={styles.messageDivContainer}>
                      <MessageContainer>
                        {item.senderId === profile?.uid && (
                          <StyledDeleteIcon
                            className="delete-icon"
                            onClick={() => {
                              handleDeleteMessage(item.id);
                            }}
                          />
                        )}
                        <span
                          style={{
                            ...styles.message,
                            ...styles.sentMessage,
                            maxWidth: "max-content",
                          }}
                        >
                          {item.content}
                        </span>
                      </MessageContainer>
                    </div>
                  ) : (
                    <div style={styles.messageDivContainer}>
                      <span
                        style={{
                          ...styles.message,
                          ...styles.receivedMessage,
                        }}
                      >
                        {item.content}
                      </span>
                    </div>
                  );
                })}
            </InfiniteScroll>
          </div>
          <ChatInput
            selectedConversation={selectedConversation || ""}
            addMessage={addMessageToConversation}
          />
        </div>
      </div>
      {isSettingsOpen && (
        <ModalOverlay>
          <div
            style={{
              position: "relative",
              borderRadius: "8px",
              backgroundColor: "rgb(233, 233, 233)",
              padding: "0 30px",
              backdropFilter: "blur(10px)",
              width: "60vh",
              height: "60vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
            }}
          >
            <SettingsModal />
          </div>
        </ModalOverlay>
      )}
      {isNewChatOpen && (
        <ModalOverlay>
          <ModalContainer>
            <NewChatModal
              setSelectedConversation={setSelectedConversation}
              setConversations={setConversations}
              setGotConversations={setGotConversations}
              users={users}
              conversations={conversations}
            />
          </ModalContainer>
        </ModalOverlay>
      )}
    </>
  );
};

export default ChatList;
