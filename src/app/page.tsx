'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { X, ChevronDown, ChevronUp, Eye, EyeOff, Settings } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';
import { getWeekDays, getTodayStartDays, isSameDay, isCurrentWeek, formatWeekRange, formatDateKey } from '@/lib/dateUtils';

import ConfirmModal from '@/components/ConfirmModal';
import DayColumn from '@/components/DayColumn';
import GroupTab from '@/components/GroupTab';
import CustomListColumn from '@/components/CustomListColumn';
import type { ConfirmModalState } from '@/types';

export default function Home() {
  const { user, loading } = useAuth();
  const {
    tasks,
    groups,
    lists,
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
    getTasksForListId,
  } = useFirestore(user?.uid);

  const [viewDate, setViewDate] = useState(new Date());

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const newGroupInputRef = useRef<HTMLInputElement>(null);

  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const newListInputRef = useRef<HTMLInputElement>(null);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    message: '',
    onConfirm: null,
  });

  const [isListsCollapsed, setIsListsCollapsed] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    if (isCreatingGroup && newGroupInputRef.current) {
      newGroupInputRef.current.focus();
    }
  }, [isCreatingGroup]);

  useEffect(() => {
    if (isCreatingList && newListInputRef.current) {
      newListInputRef.current.focus();
    }
  }, [isCreatingList]);

  const weekDays = useMemo(() => getWeekDays(viewDate), [viewDate]);
  const today = new Date();
  const isCurrent = isCurrentWeek(weekDays);

  // Current week shows 5 days from today; other weeks show full Mon–Sun
  const displayDays = useMemo(
    () => (isCurrent ? getTodayStartDays(new Date(), 5) : weekDays),
    [isCurrent, weekDays]
  );

  const navigateWeek = (delta: number) => {
    const next = new Date(viewDate);
    next.setDate(viewDate.getDate() + delta * 7);
    setViewDate(next);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupTitle.trim()) return;
    const id = await addGroup(newGroupTitle);
    setNewGroupTitle('');
    setIsCreatingGroup(false);
    if (id) setActiveGroupId(id);
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || !activeGroupId) return;
    await addList(newListTitle, activeGroupId);
    setNewListTitle('');
    setIsCreatingList(false);
  };

  const openConfirm = (message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, message, onConfirm });
  };

  const closeConfirm = () => setConfirmModal({ isOpen: false, message: '', onConfirm: null });

  const handleDeleteGroup = (groupId: string) => {
    openConfirm('Delete this group and all its lists?', async () => {
      await deleteGroup(groupId);
      closeConfirm();
    });
  };

  const handleDeleteList = (listId: string) => {
    openConfirm('Delete this list and its tasks?', async () => {
      await deleteList(listId);
      closeConfirm();
    });
  };

  const getTaskCountForGroup = (groupId: string) => {
    const groupListIds = lists.filter((l) => l.groupId === groupId).map((l) => l.id);
    return tasks.filter((t) => groupListIds.includes(t.listId) && !t.isCompleted && !t.isSection).length;
  };

  const getDisplayTasksForListId = useCallback(
    (id: string) => {
      const t = getTasksForListId(id);
      return showCompleted ? t : t.filter((task) => !task.isCompleted);
    },
    [getTasksForListId, showCompleted]
  );

  const columnsToRender = activeGroupId ? lists.filter((l) => l.groupId === activeGroupId) : [];

  const weekLabel = isCurrent ? 'Today' : formatWeekRange(weekDays);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <span className="text-xs text-gray-300 uppercase tracking-widest animate-pulse">Loading</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

      {/* Header */}
      <header className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-20 bg-white">
        <nav className="flex items-center gap-0.5 text-gray-400 w-24">
          <button
            onClick={() => navigateWeek(-4)}
            className="px-1.5 py-1 text-xs hover:text-gray-700 transition-colors font-medium"
            title="Back 4 weeks"
          >
            {'<<'}
          </button>
          <button
            onClick={() => navigateWeek(-1)}
            className="px-1.5 py-1 text-xs hover:text-gray-700 transition-colors font-medium"
          >
            {'<'}
          </button>
        </nav>

        <h1 className="text-sm font-bold uppercase tracking-widest text-gray-800">
          Nex<span className="text-gray-400">T</span>
        </h1>

        <div className="flex items-center gap-0.5 w-24 justify-end">
          <button
            onClick={() => setViewDate(new Date())}
            className={`px-2 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              isCurrent ? 'text-gray-300' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            {weekLabel}
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="px-1.5 py-1 text-xs hover:text-gray-700 transition-colors font-medium text-gray-400"
          >
            {'>'}
          </button>
          <button
            onClick={() => navigateWeek(4)}
            className="px-1.5 py-1 text-xs hover:text-gray-700 transition-colors font-medium text-gray-400"
            title="Forward 4 weeks"
          >
            {'>>'}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="min-w-full inline-block align-top">
          {/* Weekly Calendar — 5 days from today on current week, 7 days otherwise */}
          <div className="flex flex-col md:flex-row md:divide-x divide-gray-100 border-b border-gray-100">
            {displayDays.map((date) => (
              <div key={date.toISOString()} className="flex-1 min-w-[120px] px-4 py-4">
                <DayColumn
                  date={date}
                  isToday={isSameDay(date, today)}
                  tasks={getDisplayTasksForListId(formatDateKey(date))}
                  onAddTask={addTask}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onDropTask={dropTask}
                />
              </div>
            ))}
          </div>

          {/* Groups Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-0">
              {groups.map((group, i) => (
                <div key={group.id} className="flex items-center">
                  {i > 0 && <span className="text-gray-200 text-xs mx-1">·</span>}
                  <GroupTab
                    group={group}
                    isActive={activeGroupId === group.id}
                    taskCount={getTaskCountForGroup(group.id)}
                    onClick={() => setActiveGroupId(group.id)}
                    onUpdate={updateGroup}
                    onDeleteRequest={handleDeleteGroup}
                  />
                </div>
              ))}

              {isCreatingGroup ? (
                <form onSubmit={handleCreateGroup} className="flex items-center ml-2">
                  <input
                    ref={newGroupInputRef}
                    type="text"
                    placeholder="Group name..."
                    className="bg-transparent outline-none text-[11px] font-bold uppercase tracking-widest text-gray-700 w-24 border-b border-gray-300"
                    value={newGroupTitle}
                    onChange={(e) => setNewGroupTitle(e.target.value)}
                    onBlur={() => { if (!newGroupTitle.trim()) setIsCreatingGroup(false); }}
                  />
                  <button
                    type="button"
                    onMouseDown={() => setIsCreatingGroup(false)}
                    className="ml-1 text-gray-300 hover:text-gray-500"
                  >
                    <X size={12} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsCreatingGroup(true)}
                  className="ml-2 text-[11px] font-bold uppercase tracking-widest text-gray-200 hover:text-gray-400 transition-colors py-1.5 px-2"
                >
                  +
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {activeGroupId && (
                isCreatingList ? (
                  <form onSubmit={handleCreateList} className="flex items-center gap-1">
                    <input
                      ref={newListInputRef}
                      type="text"
                      placeholder="List name..."
                      className="bg-transparent outline-none text-[11px] font-bold uppercase tracking-widest text-gray-700 w-28 border-b border-gray-300"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      onBlur={() => { if (!newListTitle.trim()) setIsCreatingList(false); }}
                    />
                    <button
                      type="button"
                      onMouseDown={() => setIsCreatingList(false)}
                      className="text-gray-300 hover:text-gray-500"
                    >
                      <X size={12} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsCreatingList(true)}
                    className="text-[11px] font-bold uppercase tracking-widest text-gray-300 hover:text-gray-600 transition-colors py-1.5"
                  >
                    + New List
                  </button>
                )
              )}

              <button
                onClick={() => setIsListsCollapsed(!isListsCollapsed)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
                title={isListsCollapsed ? 'Show lists' : 'Hide lists'}
              >
                {isListsCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
            </div>
          </div>

          {/* Custom Lists */}
          {!isListsCollapsed && (
            <div className="flex overflow-x-auto pb-12 divide-x divide-gray-100">
              {columnsToRender.map((list) => (
                <div key={list.id} className="flex-1 min-w-[200px] px-4 py-4">
                  <CustomListColumn
                    listId={list.id}
                    title={list.title}
                    tasks={getDisplayTasksForListId(list.id)}
                    onAddTask={addTask}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                    onDropTask={dropTask}
                    onDeleteRequest={handleDeleteList}
                    onUpdateList={updateList}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {displayDays
            .filter((_, i) => i % 2 === 0)
            .map((date) => (
              <button
                key={date.toISOString()}
                onClick={() => setViewDate(date)}
                className={`text-[10px] font-bold transition-colors ${
                  isSameDay(date, today) ? 'text-gray-800' : 'text-gray-300 hover:text-gray-500'
                }`}
              >
                {date.getDate()}
              </button>
            ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-gray-300 hover:text-gray-500 transition-colors"
            title={showCompleted ? 'Hide completed' : 'Show completed'}
          >
            {showCompleted ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button
            className="text-gray-300 hover:text-gray-500 transition-colors"
            title="Settings"
          >
            <Settings size={13} />
          </button>
          <span className="text-[10px] text-gray-200 uppercase tracking-widest font-bold">NexT</span>
        </div>
      </footer>
    </div>
  );
}
