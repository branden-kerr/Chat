import { FC, useState, useContext } from "react";
import ThemeContext from "../../Theme/ThemeContext";

interface ChatInputProps {
  selectedConversation: string;
  addMessage: (messageContent: string) => void;
}

const ChatInput: FC<ChatInputProps> = ({ addMessage }) => {
  const [inputValue, setInputValue] = useState("");
  const theme = useContext(ThemeContext);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = () => {
    addMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSendMessage();
      event.preventDefault();
    }
  };

  const styles = {
    inputContainer: {
      height: "50px",
      display: "flex",
      alignItems: "center",
      padding: "0 10px",
      width: '80%',
    } as React.CSSProperties,
    input: {
      flex: 1,
      marginRight: "10px",
      padding: '10px',
      borderRadius: '20px',
      border: 'none',
      outline: 'none',
      fontSize: '15px',
      backgroundColor: '#F0F2F5',
    } as React.CSSProperties,
    button: {
      padding: '10px 20px',
      backgroundColor: '#1877F2',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
    } as React.CSSProperties,
  }

  return (

    <div
      style={{
        height: '20%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderTop: '1px solid #2a2d39',
      }}
    >
      <div
        className="Input-For-Chat"
        style={styles.inputContainer}
      >
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          style={styles.input}
        />
        <button style={styles.button} onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatInput;