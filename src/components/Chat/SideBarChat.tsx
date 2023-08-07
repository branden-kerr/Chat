import React, { useEffect, useContext } from "react";
import { Conversation } from "../../types";
import { formatDate } from "../../hooks/formatDate";
import { AuthContext } from "../Authentication/context/authContext";
import { SettingsModalContext, NewChatModalContext } from '../../Contexts/ModalContext';
import EditIcon from '@mui/icons-material/Edit';
import { FirebaseContext } from "../Authentication/providers/FirebaseProvider";
import ChatIcon from '@mui/icons-material/Chat';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { styled } from '@mui/system';


const styles = {
  SideBarcontainer: {
    backgroundColor: '#13141A',
  } as React.CSSProperties,
}

const StyledListItem = styled('li')({
  position: 'relative',
  padding: '0 50px',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '12%',
  cursor: 'pointer',
  '&:nth-of-type(odd)': {
    backgroundColor: '#1a1c24',
  },
  '&:hover': {
    backgroundColor: '#2a2c34', // or any other color
  },
});
interface SideBarChatProps {
  conversations: Conversation[];
  onClick: (conversation: any) => void;
  selectedConversation: string;
  retrievedUser?: any;
}

const SideBarChat: React.FC<SideBarChatProps> = (props) => {
  const { conversations, retrievedUser, } = props;
  const endOfMessagesRef = React.useRef<null | HTMLLIElement>(null);
  const { profile } = useContext(AuthContext);
  const { myFS }: any = useContext(FirebaseContext);
  const { toggle: toggleSettings } = useContext(SettingsModalContext);
  const { toggle: toggleNewChat } = useContext(NewChatModalContext);


  const avatarUrl = profile.displayPicture ? profile.displayPicture : '';

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [conversations]);

  return (
    <>
      <div
        style={{
          gridColumn: '1 / 3',
          display: 'grid',
          gridTemplateRows: '15% 85%',
          gridTemplateColumns: '100%',
        }}
      >
        <div
          style={{
            borderRight: '1px solid #2a2d39',
            borderBottom: '1px solid #2a2d39',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 20px',
            // height: '15%',
            gridRow: '1/2',
            gridColumn: '1/2',
            color: '#FFFFFF',
          }}
        >
          <div>
            <img
              src={avatarUrl}
              alt="Avatar"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                outline: '2px solid white',
                marginLeft: '20px'
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '20%',
              height: '100%',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '4% 0',
            }}
          >
            <button
              onClick={toggleSettings}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-start'
              }}
            >
              <EditIcon
                style={{
                  marginRight: '15px'
                }}
              />
              <span>
                Settings
              </span>
            </button>
            <button
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-start'
              }}
              onClick={toggleNewChat}
            >
              <ChatIcon
                style={{
                  marginRight: '15px'
                }}
              />
              <span>
                New Chat
              </span>
            </button>
          </div>
        </div>
        {conversations.length > 0 ? (
          <ul
            style={{
              ...styles.SideBarcontainer,
              gridRow: '2/3',
              gridColumn: '1/2',
              borderRight: '1px solid #2a2d39',
              height: '100%',
            }}
          >
            {
              conversations.map((conversation: any, index: any) => {

                return (
                  <StyledListItem
                    key={conversation.id}
                    onClick={() => props.onClick(conversation.id)}
                    ref={index === conversations.length - 1 ? endOfMessagesRef : null}
                  >
                    <div
                      style={{
                        display: 'flex'
                      }}
                    >
                      <img
                        style={{
                          height: '65px',
                          width: '65px',
                          borderRadius: '50%',
                          marginRight: '15px',
                          outline: '2px solid white',
                        }}
                        src={conversation.displayPicture}
                        alt=""
                      />
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 'bold',
                            fontSize: '1.2em',
                            cursor: 'pointer',
                          }}
                        >
                          <strong>
                            {conversation.username}
                          </strong>
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <span>
                            {conversation.lastMessage ? conversation.lastMessage : 'No messages yet'}
                          </span>
                          <span
                            style={{ fontStyle: 'italic' }}
                          >  {formatDate(conversation.lastInteractionTime, false)}
                          </span>
                        </div>
                      </div>

                    </div>
                    <ArrowForwardIcon />
                  </StyledListItem>
                )
              })
            }
          </ul>
        ) :
          (
            <div
              style={{
                borderRight: '1px solid #2a2d39',
                gridColumn: '1/3',
                width: '100%',
                height: '100%',
                padding: '2em',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <h1 style={{
                color: '#ffffff',
                fontSize: '1.5em',
                fontWeight: 'bold',
                marginBottom: '1em',
                textAlign: 'center',
              }}>
                No conversations yet
              </h1>
              <button
                style={{
                  fontSize: '1em',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  backgroundColor: '#1877F2',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5em 1em',
                  cursor: 'pointer',
                }}
                onClick={toggleNewChat}
              >
                Create One
              </button>
            </div>
          )
        }
      </div>
    </>
  )
};

export default SideBarChat;
