import { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  text: string;
  listId: string;
  isCompleted: boolean;
  isRecurring: boolean;
  createdAt: Timestamp | null;
}

export interface Group {
  id: string;
  title: string;
  createdAt: Timestamp | null;
}

export interface TaskList {
  id: string;
  title: string;
  groupId: string;
  createdAt: Timestamp | null;
}

export interface ConfirmModalState {
  isOpen: boolean;
  message: string;
  onConfirm: (() => void) | null;
}
