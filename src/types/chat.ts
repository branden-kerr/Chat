import { Timestamp } from "firebase/firestore";

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timeSent: Timestamp;
  type: 'text' | 'image' | 'video';
}

export interface Conversation {
  id: string;
  otherPersonId: string;
  username: string;
  lastMessage: string;
  lastInteractionTime?: any;
  displayPicture: string;
}