'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { getFirebaseDb, APP_ID } from '@/lib/firebase';
import type { Task, Group, TaskList } from '@/types';

const userPath = (uid: string) => `artifacts/${APP_ID}/users/${uid}`;

export function useFirestore(uid: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [userName, setUserName] = useState('USER');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // Initialize default data (GTD) on first login
  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();

    const initDefaults = async () => {
      const settingsRef = doc(db, userPath(uid), 'settings', 'initialization');
      const snap = await getDoc(settingsRef);
      if (snap.exists()) return;

      const gtdRef = await addDoc(collection(db, userPath(uid), 'groups'), {
        title: 'GTD',
        createdAt: serverTimestamp(),
      });

      for (const title of ['Inbox', 'Next Actions', 'Waiting For', 'Someday/Maybe']) {
        await addDoc(collection(db, userPath(uid), 'lists'), {
          title,
          groupId: gtdRef.id,
          createdAt: serverTimestamp(),
        });
      }

      await setDoc(settingsRef, { initialized: true });
    };

    initDefaults();
  }, [uid]);

  // Realtime listeners
  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();

    const profileRef = doc(db, userPath(uid), 'settings', 'profile');
    const unsubProfile = onSnapshot(profileRef, (snap) => {
      if (snap.exists() && snap.data().name) setUserName(snap.data().name);
    });

    const unsubTasks = onSnapshot(
      query(collection(db, userPath(uid), 'tasks'), orderBy('createdAt', 'asc')),
      (s) => setTasks(s.docs.map((d) => ({ id: d.id, ...d.data() } as Task)))
    );

    const unsubGroups = onSnapshot(
      query(collection(db, userPath(uid), 'groups'), orderBy('createdAt', 'asc')),
      (s) => {
        const fetched = s.docs.map((d) => ({ id: d.id, ...d.data() } as Group));
        setGroups(fetched);
        setActiveGroupId((prev) => {
          if (fetched.length === 0) return null;
          return fetched.find((g) => g.id === prev) ? prev : fetched[0].id;
        });
      }
    );

    const unsubLists = onSnapshot(
      query(collection(db, userPath(uid), 'lists'), orderBy('createdAt', 'asc')),
      (s) => setLists(s.docs.map((d) => ({ id: d.id, ...d.data() } as TaskList)))
    );

    return () => {
      unsubProfile();
      unsubTasks();
      unsubGroups();
      unsubLists();
    };
  }, [uid]);

  // Tasks
  const addTask = useCallback(
    async (text: string, listId: string) => {
      if (!uid) return;
      const db = getFirebaseDb();
      await addDoc(collection(db, userPath(uid), 'tasks'), {
        text,
        listId,
        isCompleted: false,
        isRecurring: false,
        createdAt: serverTimestamp(),
      });
    },
    [uid]
  );

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      if (!uid) return;
      const db = getFirebaseDb();
      await updateDoc(doc(db, userPath(uid), 'tasks', taskId), updates);
    },
    [uid]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!uid) return;
      const db = getFirebaseDb();
      await deleteDoc(doc(db, userPath(uid), 'tasks', taskId));
    },
    [uid]
  );

  const dropTask = useCallback(
    (taskId: string, newListId: string) => updateTask(taskId, { listId: newListId }),
    [updateTask]
  );

  // Groups
  const addGroup = useCallback(
    async (title: string): Promise<string | null> => {
      if (!uid) return null;
      const db = getFirebaseDb();
      const ref = await addDoc(collection(db, userPath(uid), 'groups'), {
        title,
        createdAt: serverTimestamp(),
      });
      return ref.id;
    },
    [uid]
  );

  const updateGroup = useCallback(
    async (groupId: string, title: string) => {
      if (!uid) return;
      const db = getFirebaseDb();
      await updateDoc(doc(db, userPath(uid), 'groups', groupId), { title });
    },
    [uid]
  );

  const deleteGroup = useCallback(
    async (groupId: string) => {
      if (!uid) return;
      const db = getFirebaseDb();
      await deleteDoc(doc(db, userPath(uid), 'groups', groupId));
    },
    [uid]
  );

  // Lists
  const addList = useCallback(
    async (title: string, groupId: string) => {
      if (!uid) return;
      const db = getFirebaseDb();
      await addDoc(collection(db, userPath(uid), 'lists'), {
        title,
        groupId,
        createdAt: serverTimestamp(),
      });
    },
    [uid]
  );

  const updateList = useCallback(
    async (listId: string, title: string) => {
      if (!uid) return;
      const db = getFirebaseDb();
      await updateDoc(doc(db, userPath(uid), 'lists', listId), { title });
    },
    [uid]
  );

  const deleteList = useCallback(
    async (listId: string) => {
      if (!uid) return;
      const db = getFirebaseDb();
      await deleteDoc(doc(db, userPath(uid), 'lists', listId));
    },
    [uid]
  );

  // Profile
  const saveUserName = useCallback(
    async (name: string) => {
      if (!uid) return;
      const db = getFirebaseDb();
      setUserName(name);
      await setDoc(
        doc(db, userPath(uid), 'settings', 'profile'),
        { name },
        { merge: true }
      );
    },
    [uid]
  );

  const getTasksForListId = useCallback(
    (id: string) => tasks.filter((t) => t.listId === id),
    [tasks]
  );

  return {
    tasks,
    groups,
    lists,
    userName,
    activeGroupId,
    setActiveGroupId,
    addTask,
    updateTask,
    deleteTask,
    dropTask,
    addGroup,
    updateGroup,
    deleteGroup,
    addList,
    updateList,
    deleteList,
    saveUserName,
    getTasksForListId,
  };
}
