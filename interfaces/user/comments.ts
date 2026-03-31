export interface SerializableCommentUser {
  id: string;
  firstName: string;
  lastName: string | null;
}

export interface SerializableComment {
  id: number;
  text: string;
  createdAt: Date;
  user: SerializableCommentUser;
}

export interface CompanyComment {
  id: number;
  text: string;
  createdAt: string;
  user: SerializableCommentUser;
}
