import { Timestamp } from "firebase/firestore";

export type Comment = {
  id: string;
  creatorHandle: string;
  commentCreatorId: string;
  content: string;
  profilePicture: string;
  timestamp: Timestamp;
};

export type Post = {
  timestamp: Date;
  firestoreDocumentId: string;
  creatorOfPostId: string;
  username: string;
  handle: string;
  displayPicture: string;
  content: string;
  media: string;
  engagementScore: number;
  index: number;
  comments?: Comment[];
  likes?: { [uid: string]: boolean };
};
