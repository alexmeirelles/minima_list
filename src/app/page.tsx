'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';
import { getWeekDays, isSameDay, isCurrentWeek, formatWeekRange, formatDateKey } from '@/lib/dateUtils';

import ConfirmModal from '@/components/ConfirmModal';
import DayColumn from '@/components/DayColumn';
import GroupTab from '@/components/GroupTab';
import CustomListColumn from '@/components/CustomListColumn';
import NewListPlaceholder from '@/components/NewListPlaceholder';
import type { ConfirmModalState } from '@/types';

export default function Home() {
  const { user, loading } = useAuth();
  const {
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
  } = useFirestore(user?.uid);

  const [viewDate, setViewDate] = useState(new Date());
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(userName);

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const newGroupInputRef = useRef<HTMLInputElement>(null);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    message: '',
    onConfirm: null,
  });

  useEffect(() => {
    setEditNameValue(userName);
  }, [userName]);

  useEffect(() => {
    if (isCreatingGroup && newGroupInputRef.current) {
      newGroupInputRef.current.focus();
    }
  }, [isCreatingGroup]);

  const weekDays = useMemo(() => getWeekDays(viewDate), [viewDate]);
  const today = new Date();
  const isCurrent = isCurrentWeek(weekDays);
  const dateHeaderText = isCurrent ? 'This Week' : formatWeekRange(weekDays);

  const navigateWeek = (direction: number) => {
    const next = new Date(viewDate);
    next.setDate(viewDate.getDate() + direction * 7);
    setViewDate(next);
  };

  const handleNameSave = () => {
    if (editNameValue.trim()) saveUserName(editNameValue);
    setIsEditingName(false);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupTitle.trim()) return;
    const id = await addGroup(newGroupTitle);
    setNewGroupTitle('');
    setIsCreatingGroup(false);
    if (id) setActiveGroupId(id);
  };

  const openConfirm = (message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, message, onConfirm });
  };

  const closeConfirm = () => setConfirmModal({ isOpen: false, message: '', onConfirm: null });

  const handleDeleteGroup = (groupId: string) => {
    openConfirm('Apagar este grupo e todas as listas dentro dele?', async () => {
      await deleteGroup(groupId);
      closeConfirm();
    });
  };

  const handleDeleteList = (listId: string) => {
    openConfirm('Apagar esta lista e as suas tarefas?', async () => {
      await deleteList(listId);
      closeConfirm();
    });
  };

  const columnsToRender = activeGroupId ? lists.filter((l) => l.groupId === activeGroupId) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <span className="text-[#967259] text-sm font-bold uppercase tracking-widest animate-pulse">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-[#967259]/20 selection:text-[#5D4037] flex flex-col">
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

      {/* Navbar */}
      <header className="px-6 py-6 flex items-center justify-between bg-white sticky top-0 z-20 md:relative">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-bold tracking-tight text-black uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Nex<span className="text-[#967259]">T</span>
          </h1>

          <div className="hidden md:flex items-center bg-gray-100 rounded-full px-1 py-1">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-1 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-500 hover:text-black"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setViewDate(new Date())}
              className={`px-4 py-1 text-xs font-bold uppercase tracking-wide transition-colors whitespace-nowrap min-w-[100px] ${
                isCurrent ? 'text-gray-600 hover:text-[#967259]' : 'text-[#967259]'
              }`}
            >
              {dateHeaderText}
            </button>
            <button
              onClick={() => navigateWeek(1)}
              className="p-1 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-500 hover:text-black"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="text-xs font-bold text-gray-400 hidden md:flex items-center gap-1">
          <span>WELCOME,</span>
          {isEditingName ? (
            <input
              autoFocus
              className="bg-transparent border-b border-gray-400 outline-none w-24 text-gray-600 uppercase font-bold"
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave();
                if (e.key === 'Escape') setIsEditingName(false);
              }}
            />
          ) : (
            <span
              onClick={() => setIsEditingName(true)}
              className="cursor-pointer hover:text-gray-600 transition-colors uppercase"
              title="Click to edit name"
            >
              {userName}
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-x-auto overflow-y-auto px-4 md:px-6 pb-20">
        <div className="min-w-full inline-block align-top">
          {/* Weekly Calendar */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-4 mb-12 border-b border-gray-100 pb-12">
            {weekDays.map((date) => (
              <div key={date.toISOString()} className="flex-1 min-w-0">
                <DayColumn
                  date={date}
                  isToday={isSameDay(date, today)}
                  tasks={getTasksForListId(formatDateKey(date))}
                  onAddTask={addTask}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onDropTask={dropTask}
                />
              </div>
            ))}
          </div>

          {/* Groups Toolbar */}
          <div className="flex items-center gap-2 mb-6">
            {groups.map((group) => (
              <GroupTab
                key={group.id}
                group={group}
                isActive={activeGroupId === group.id}
                onClick={() => setActiveGroupId(group.id)}
                onUpdate={updateGroup}
                onDeleteRequest={handleDeleteGroup}
              />
            ))}

            <div className="ml-2 pl-2 border-l border-gray-200">
              {isCreatingGroup ? (
                <form
                  onSubmit={handleCreateGroup}
                  className="flex items-center bg-gray-50 rounded-sm px-2 py-1 border border-gray-200 shadow-sm"
                >
                  <input
                    ref={newGroupInputRef}
                    type="text"
                    placeholder="New Group..."
                    className="bg-transparent outline-none text-[11px] font-bold uppercase text-gray-700 w-24"
                    value={newGroupTitle}
                    onChange={(e) => setNewGroupTitle(e.target.value)}
                    onBlur={() => {
                      if (!newGroupTitle.trim()) setIsCreatingGroup(false);
                    }}
                  />
                  <button
                    type="button"
                    onMouseDown={() => setIsCreatingGroup(false)}
                    className="ml-1 text-gray-400 hover:text-[#967259]"
                  >
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsCreatingGroup(true)}
                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-gray-300 hover:text-[#967259] transition-colors py-1"
                >
                  <Plus size={14} />
                  <span>New Group</span>
                </button>
              )}
            </div>
          </div>

          {/* Custom Lists */}
          <div className="flex overflow-x-auto pb-8 gap-8 items-start">
            {columnsToRender.map((list) => (
              <CustomListColumn
                key={list.id}
                listId={list.id}
                title={list.title}
                tasks={getTasksForListId(list.id)}
                onAddTask={addTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onDropTask={dropTask}
                onDeleteRequest={handleDeleteList}
                onUpdateList={updateList}
              />
            ))}
            {activeGroupId && (
              <NewListPlaceholder onCreateList={(title) => addList(title, activeGroupId)} />
            )}
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-[10px] text-gray-300 uppercase tracking-widest font-bold">
        NexT © 2026
      </footer>
    </div>
  );
}
