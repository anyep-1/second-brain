export type FolderSummary = {
  id: string;
  name: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string | null;
};

export type NoteTag = {
  tag: Tag;
};

export type NoteLink = {
  sourceNoteId: string;
  targetNoteId: string;
  createdAt: string;
};

export type Note = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  isFavorite: boolean;
  isArchived: boolean;
  folderId: string | null;
  folder: FolderSummary | null;
  tags: NoteTag[];
  incomingLinks?: NoteLink[];
  outgoingLinks?: NoteLink[];
  createdAt: string;
  updatedAt: string;
};

export type CreateNoteInput = {
  title: string;
  content: string;
};

export type UpdateNoteInput = {
  title?: string;
  content?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
};

export type DataResponse<T> = {
  data: T;
};

export type MessageResponse = {
  message: string;
};