import React, { useEffect, useContext } from "react";
import { Conversation } from "../../types";
import { formatDate } from "../../hooks/formatDate";
import { AuthContext } from "../Authentication/context/authContext";
import {
  SettingsModalContext,
  NewChatModalContext,
} from "../../Contexts/ModalContext";
import EditIcon from "@mui/icons-material/Edit";
import { FirebaseContext } from "../Authentication/providers/FirebaseProvider";
import ChatIcon from "@mui/icons-material/Chat";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { styled } from "@mui/system";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteDoc, doc } from "firebase/firestore";
import { ref, set } from "firebase/database";

const styles = {
  SideBarcontainer: {
    backgroundColor: "#13141A",
  } as React.CSSProperties,
};

const SideBarChatContainer = styled("div")({
  gridColumn: "1 / 3",
  display: "grid",
  gridTemplateRows: "15% 85%",
  gridTemplateColumns: "100%",
  "@media (max-width: 743px)": {
    gridTemplateRows: "30% 70%",
  },
});

const OptionsContainer = styled("div")({
  borderRight: "1px solid #2a2d39",
  borderBottom: "1px solid #2a2d39",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 20px",
  gridRow: "1/2",
  gridColumn: "1/2",
  color: "#FFFFFF",
  "@media (max-width: 743px)": {
    flexDirection: "column",
    justifyContent: "space-evenly",
  },
});

const DisplayPicture = styled("img")({
  width: "100px",
  height: "100px",
  borderRadius: "50%",
  outline: "2px solid white",
  marginLeft: "20px",
  objectFit: "cover",
  "@media (max-width: 903px)": {
    minWidth: "85px",
    minHeight: "85px",
    marginLeft: "10px",
  },
});

const SettingsAndNewChat = styled("div")({
  display: "flex",
  flexDirection: "column",
  width: "20%",
  height: "100%",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "4% 0",
  "@media (max-width: 1500px)": {
    width: "30%",
  },
  "@media (max-width: 1100px)": {
    width: "40%",
    padding: "11% 0",
    marginRight: "20px",
  },
  "@media (max-width: 903px)": {
    width: "35%",
    padding: "13% 0",
    marginRight: "10px",
  },
  "@media (max-width: 839px)": {
    width: "35%",
    padding: "13% 0",
    marginRight: "25px",
  },
  "@media (max-width: 743px)": {
    width: "100%",
    height: "40%",
    padding: "3%",
    marginRight: "0",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
});

const ButtonsSettingsNewChat = styled("button")({
  width: "100%",
  display: "flex",
  justifyContent: "flex-start",
  "@media (max-width: 743px)": {
    justifyContent: "center",
    paddingRight: "15px",
  },
});

const StyledListItem = styled("li")({
  position: "relative",
  padding: "0 50px",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "12%",
  cursor: "pointer",
  // backgroundColor: '#1a1c24',
  "&:hover": {
    backgroundColor: "#264eee", // or any other color
  },
});

const StyledDeleteIcon = styled(DeleteIcon)({
  fontSize: "1.2em",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    color: "red",
    transform: "scale(1.2)",
  },
});

interface SideBarChatProps {
  conversations: Conversation[];
  onClick: (conversation: any) => void;
  selectedConversation: string;
  retrievedUser?: any;
  setConversations: (conversations: any) => void;
}

const SideBarChat: React.FC<SideBarChatProps> = (props) => {
  const { conversations, retrievedUser, setConversations } = props;
  const endOfMessagesRef = React.useRef<null | HTMLLIElement>(null);
  const { profile } = useContext(AuthContext);
  const { myFS, myRLDB }: any = useContext(FirebaseContext);
  const { toggle: toggleSettings } = useContext(SettingsModalContext);
  const { toggle: toggleNewChat } = useContext(NewChatModalContext);
  const avatarUrl = profile.displayPicture ? profile.displayPicture : "";

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [conversations]);

  const handleDeleteConversation = async (conversationId: string) => {
    const conversationToDeleteIndex = conversations.findIndex(
      (conversation: Conversation) => conversation.id === conversationId
    );
    const conversationToDelete = conversations[conversationToDeleteIndex];

    try {
      await deleteDoc(
        doc(myFS, `users/${profile.uid}/conversations/${conversationId}`)
      );
      setConversations((prevConversations: any) => {
        return prevConversations.filter(
          (conversation: Conversation) => conversation.id !== conversationId
        );
      });
      const conversationRef = ref(myRLDB, "conversations/" + conversationId);
      await set(conversationRef, null);
      console.log("Conversation successfully deleted!");
    } catch (error) {
      setConversations((prevConversations: Conversation[]) => {
        const updatedConversations = [...prevConversations];
        updatedConversations.splice(
          conversationToDeleteIndex,
          0,
          conversationToDelete
        );
        return updatedConversations;
      });
      console.log(error);
    }
  };

  return (
    <>
      <SideBarChatContainer>
        <OptionsContainer>
          <DisplayPicture src={avatarUrl} alt="Avatar" />
          <SettingsAndNewChat>
            <ButtonsSettingsNewChat>
              <EditIcon
                style={{
                  marginRight: "15px",
                }}
              />
              <span>Settings</span>
            </ButtonsSettingsNewChat>
            <ButtonsSettingsNewChat onClick={toggleNewChat}>
              <ChatIcon
                style={{
                  marginRight: "15px",
                }}
              />
              <span
                style={{
                  minWidth: "max-content",
                }}
              >
                New Chat
              </span>
            </ButtonsSettingsNewChat>
          </SettingsAndNewChat>
        </OptionsContainer>
        {conversations.length > 0 ? (
          <ul
            style={{
              ...styles.SideBarcontainer,
              gridRow: "2/3",
              gridColumn: "1/2",
              borderRight: "1px solid #2a2d39",
              height: "100%",
            }}
          >
            {conversations.map((conversation: any, index: any) => {
              return (
                <StyledListItem
                  key={conversation.id}
                  onClick={() => props.onClick(conversation.id)}
                  ref={
                    index === conversations.length - 1 ? endOfMessagesRef : null
                  }
                  style={{
                    backgroundColor:
                      props.selectedConversation === conversation.id
                        ? "#2a2c34"
                        : "initial",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <img
                      style={{
                        height: "60px",
                        width: "60px",
                        borderRadius: "50%",
                        marginRight: "15px",
                        outline: "2px solid white",
                      }}
                      src={conversation.displayPicture}
                      alt=""
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "bold",
                          fontSize: "1em",
                          cursor: "pointer",
                        }}
                      >
                        <strong>{conversation.username}</strong>
                      </span>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          fontSize: ".75em",
                        }}
                      >
                        <span>
                          {conversation.lastMessage
                            ? conversation.lastMessage.length > 40
                              ? conversation.lastMessage.slice(0, 40) + "..."
                              : conversation.lastMessage
                            : "No messages yet"}
                        </span>
                        <span style={{ fontStyle: "italic" }}>
                          {" "}
                          {formatDate(conversation.lastInteractionTime, false)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <ArrowForwardIcon
                      style={{
                        fontSize: "1.2em",
                      }}
                    />
                    <StyledDeleteIcon
                      onClick={() => {
                        handleDeleteConversation(conversation.id);
                      }}
                    />
                  </div>
                </StyledListItem>
              );
            })}
          </ul>
        ) : (
          <div
            style={{
              borderRight: "1px solid #2a2d39",
              gridColumn: "1/3",
              width: "100%",
              height: "100%",
              padding: "2em",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h1
              style={{
                color: "#ffffff",
                fontSize: "1.5em",
                fontWeight: "bold",
                marginBottom: "1em",
                textAlign: "center",
              }}
            >
              No conversations yet
            </h1>
            <button
              style={{
                fontSize: "1em",
                fontWeight: "bold",
                color: "#FFFFFF",
                backgroundColor: "#1877F2",
                border: "none",
                borderRadius: "4px",
                padding: "0.5em 1em",
                cursor: "pointer",
              }}
              onClick={toggleNewChat}
            >
              Create One
            </button>
          </div>
        )}
      </SideBarChatContainer>
    </>
  );
};

export default SideBarChat;
