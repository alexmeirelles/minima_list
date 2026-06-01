'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTodoStore, type TodoItem } from '@/store/useTodoStore';
import { getWeekDays, getTodayStartDays, formatDateKey } from '@/lib/dateUtils';
import { parseTodoText } from '@/lib/markdown';
import { useTranslations } from '@/hooks/useTranslations';

// Components
import DayColumn from '@/components/DayColumn';
import CustomListColumn from '@/components/CustomListColumn';
import NoteSidebar from '@/components/NoteSidebar';
import RecurringModal from '@/components/RecurringModal';
import {
  SearchIcon,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronLeftDouble,
  ChevronRightDouble,
  DarkModeIcon,
  LightModeIcon,
  RecurringIcon,
  UserIcon,
  RotateCcwIcon,
  XIcon,
} from '@/components/Icons';

export default function Home() {
  const {
    todos,
    somedayLists,
    workspaceName,
    setWorkspaceName,
    darkMode,
    setDarkMode,
    gridColumnSize,
    setGridColumnSize,
    inFocusMode,
    setInFocusMode,
    moveTodo,
    instantiateRecurringTodos,
    selectedTodo,
    addSomedayList,
    language,
    setLanguage,
  } = useTodoStore();

  const t = useTranslations();

  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  
  // Modals / Panels states
  const [isRecurringOpen, setIsRecurringOpen] = useState(false);
  const [isSomedayCollapsed, setIsSomedayCollapsed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Date input ref for picker
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Initialize/persist dark mode class on body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires moving 8px before drag triggers, allowing click events to pass
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Generate displayed days based on viewDate and column setting
  const displayedDays = useMemo(() => {
    const startOfWeek = new Date(viewDate);
    // Align with Monday
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const daysList: Date[] = [];
    
    // Focus Mode displays only today/viewDate
    if (inFocusMode) {
      return [viewDate];
    }

    // Standard column counts: 1, 3, 5, or 7
    const count = gridColumnSize;
    for (let i = 0; i < count; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      daysList.push(d);
    }
    return daysList;
  }, [viewDate, gridColumnSize, inFocusMode]);

  // Instantiate recurring tasks whenever visible dates change
  useEffect(() => {
    const dates = displayedDays.map((d) => formatDateKey(d));
    instantiateRecurringTodos(dates);
  }, [displayedDays, instantiateRecurringTodos]);

  const navigateDays = (delta: number) => {
    const next = new Date(viewDate);
    next.setDate(viewDate.getDate() + delta);
    setViewDate(next);
  };

  const navigateWeeks = (delta: number) => {
    const next = new Date(viewDate);
    next.setDate(viewDate.getDate() + delta * 7);
    setViewDate(next);
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setViewDate(new Date(e.target.value + 'T00:00:00'));
    }
  };

  // Helper to find a todo's path in state
  const findTodoPath = (todoId: string) => {
    // Search calendar days
    for (const [dateKey, list] of Object.entries(todos)) {
      const idx = list.findIndex((item) => item.id === todoId);
      if (idx !== -1) {
        return { containerId: dateKey, isSomeday: false, index: idx, item: list[idx] };
      }
    }
    // Search someday lists
    for (const list of somedayLists) {
      const idx = list.items.findIndex((item) => item.id === todoId);
      if (idx !== -1) {
        return { containerId: list.id, isSomeday: true, index: idx, item: list.items[idx] };
      }
    }
    return null;
  };

  // Drag and drop event handlers
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTodoId = active.id as string;
    const overId = over.id as string;

    const activePath = findTodoPath(activeTodoId);
    if (!activePath) return;

    // Check if dropping onto a container column (empty column zone or list header zone)
    const isOverContainer =
      todos[overId] !== undefined ||
      somedayLists.some((l) => l.id === overId);

    if (isOverContainer) {
      const isTargetSomeday = somedayLists.some((l) => l.id === overId);
      // Move to end of target container
      moveTodo(
        activePath.containerId,
        overId,
        activeTodoId,
        activePath.isSomeday,
        isTargetSomeday
      );
    } else {
      // Dropping onto/relative to another list item
      const overPath = findTodoPath(overId);
      if (!overPath) return;

      moveTodo(
        activePath.containerId,
        overPath.containerId,
        activeTodoId,
        activePath.isSomeday,
        overPath.isSomeday,
        overPath.index
      );
    }
  };

  // Find dragging item for Overlay
  const draggingItem = useMemo(() => {
    if (!activeId) return null;
    const path = findTodoPath(activeId);
    return path ? path.item : null;
  }, [activeId]);

  // Create new list
  const handleCreateList = () => {
    const name = prompt('Enter the name of your new Someday list:');
    if (name?.trim()) {
      addSomedayList(name.trim());
    }
  };

  // Reset dashboard state
  const handleResetData = () => {
    if (confirm(t.confirmReset)) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Filter lists based on Search Query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const results: { text: string; dateOrList: string; isSomeday: boolean; todo: TodoItem }[] = [];
    
    // Search calendar days
    Object.entries(todos).forEach(([dateKey, list]) => {
      list.forEach((item) => {
        if (item.text.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ text: item.text, dateOrList: dateKey, isSomeday: false, todo: item });
        }
      });
    });

    // Search someday lists
    somedayLists.forEach((list) => {
      list.items.forEach((item) => {
        if (item.text.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ text: item.text, dateOrList: list.name, isSomeday: true, todo: item });
        }
      });
    });

    return results;
  }, [searchQuery, todos, somedayLists]);

  return (
    <div className="app-root">
      {/* Search overlay/dropdown */}
      {showSearch && (
        <div className="bg-[var(--someday-list-background)] border-b border-[var(--todo-border-color)] px-6 py-4 flex flex-col gap-3 relative z-50 shadow-md">
          <div className="flex items-center gap-3 w-full max-w-2xl mx-auto">
            <SearchIcon size={18} className="text-[var(--todo-past-text-color)]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="flex-1 bg-transparent border-none text-sm text-[var(--todo-text-color)] outline-none placeholder-[var(--todo-past-text-color)] font-medium"
            />
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
              className="text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)]"
              type="button"
            >
              <XIcon size={16} />
            </button>
          </div>
          
          {searchQuery && (
            <div className="w-full max-w-2xl mx-auto bg-[var(--app-background)] border border-[var(--todo-border-color)] rounded-lg shadow-xl max-h-[300px] overflow-y-auto divide-y divide-[var(--todo-border-color)]">
              {searchResults.length === 0 ? (
                <div className="p-4 text-xs text-[var(--todo-past-text-color)] text-center">
                  {t.searchNoResults}
                </div>
              ) : (
                searchResults.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      const storeSelected = useTodoStore.getState().setSelectedTodo;
                      storeSelected({
                        id: res.todo.id,
                        dateOrListId: res.isSomeday
                          ? somedayLists.find((l) => l.name === res.dateOrList)?.id || 'someday-default'
                          : res.dateOrList,
                        isSomeday: res.isSomeday,
                      });
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                    className="p-3 text-sm text-left hover:bg-[var(--someday-list-background)] cursor-pointer flex flex-col gap-1 transition-all"
                  >
                    <p className="font-semibold text-[var(--todo-text-color)]">{res.todo.text}</p>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--custom-color)]">
                      {res.isSomeday ? `${t.searchResultSomeday}: ${res.dateOrList}` : `${t.searchResultCalendar}: ${res.dateOrList}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Hidden input for calendar date picker */}
      <input
        ref={dateInputRef}
        type="date"
        onChange={handleDatePickerChange}
        className="sr-only"
      />

      {/* DndContext wrapping core areas */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* HEADER */}
        <header className="app-header">
          {/* Left: Search Toggle & Workspace Name */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1 rounded hover:bg-[var(--timer-bg)] text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)] transition-all"
              title={t.searchTasks}
              type="button"
            >
              <SearchIcon size={18} />
            </button>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder={t.workspacePlaceholder}
              className="bg-transparent border-none outline-none font-semibold text-xs tracking-wider text-[var(--todo-past-text-color)] placeholder-[var(--todo-past-text-color)]/50 focus:placeholder-transparent transition-all w-48 text-left"
            />
          </div>

          {/* Center: Brand Logo */}
          <div className="header-logo select-none">
            NEXXXT<span>.</span>
          </div>

          {/* Right: Weeks Navigation Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateWeeks(-1)}
              className="p-1 rounded hover:bg-[var(--timer-bg)] text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)] transition-colors"
              title={t.previousWeek}
              type="button"
            >
              <ChevronLeftDouble size={16} />
            </button>
            <button
              onClick={() => navigateDays(-1)}
              className="p-1 rounded hover:bg-[var(--timer-bg)] text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)] transition-colors"
              title={t.previousDay}
              type="button"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => setViewDate(new Date())}
              className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)] hover:bg-[var(--timer-bg)] rounded transition-colors"
              title={t.goToToday}
              type="button"
            >
              {t.today}
            </button>

            <button
              onClick={() => navigateDays(1)}
              className="p-1 rounded hover:bg-[var(--timer-bg)] text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)] transition-colors"
              title={t.nextDay}
              type="button"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => navigateWeeks(1)}
              className="p-1 rounded hover:bg-[var(--timer-bg)] text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)] transition-colors"
              title={t.nextWeek}
              type="button"
            >
              <ChevronRightDouble size={16} />
            </button>

            {/* Datepicker icon button */}
            <button
              onClick={() => dateInputRef.current?.showPicker()}
              className="p-1 rounded hover:bg-[var(--timer-bg)] text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)] transition-colors ml-1"
              title={t.chooseDate}
              type="button"
            >
              <CalendarIcon size={16} />
            </button>
          </div>
        </header>

        {/* CORE APPLICATION LAYOUT CONTAINER */}
        <div className="app-layout">
          
          {/* CALENDAR SECTION (TOP HALF) */}
          <section className="calendar-section">
            <div className="calendar-grid min-w-full">
              {displayedDays.map((date) => {
                const dateKey = formatDateKey(date);
                const dayTasks = todos[dateKey] || [];
                return (
                  <DayColumn
                    key={dateKey}
                    date={date}
                    tasks={dayTasks}
                  />
                );
              })}
            </div>
          </section>

          {/* SOMEDAY DIVIDER / TOOLBAR */}
          <div className="someday-toolbar select-none">
            <nav className="someday-list-tabs">
              <div className="someday-list-tabs__tabs">
                <div className="someday-list-tabs__tab someday-list-tabs__tab--active">
                  <span>{t.somedayLists}</span>
                  <span className="someday-list-tabs__number">
                    {somedayLists.reduce((acc, curr) => acc + curr.items.length, 0)}
                  </span>
                </div>
              </div>
              
              {/* Add list button */}
              <button
                onClick={handleCreateList}
                className="someday-list-tabs__add"
                title={t.createList}
                type="button"
              >
                +
              </button>
            </nav>

            {/* Collapse list button */}
            <button
              onClick={() => setIsSomedayCollapsed(!isSomedayCollapsed)}
              className="someday-collapse__icon"
              style={{ transform: isSomedayCollapsed ? 'rotate(180deg)' : 'none' }}
              title={isSomedayCollapsed ? t.expandSomeday : t.collapseSomeday}
              type="button"
            >
              ▼
            </button>
          </div>

          {/* SOMEDAY SECTION (BOTTOM HALF) */}
          {!isSomedayCollapsed && (
            <section className="someday-list-section">
              <div className="someday-lists-grid">
                {somedayLists.map((list) => (
                  <CustomListColumn
                    key={list.id}
                    listId={list.id}
                    name={list.name}
                    items={list.items}
                  />
                ))}

                {/* Create List Call-to-action Column */}
                <div className="todo todo--secondary flex flex-col justify-center items-center opacity-60 hover:opacity-100 transition-all p-6 min-w-[204px] border-r border-[var(--footer-border-color)]">
                  <button
                    onClick={handleCreateList}
                    className="flex flex-col items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--todo-past-text-color)] hover:text-[var(--custom-color)] transition-colors"
                    type="button"
                  >
                    <span className="text-3xl">+</span>
                    {t.newList}
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* STICKY FOOTER */}
        <footer className="app-footer select-none">
          <div className="app-footer-toolbar">
            
            {/* Left: Preferences / Clear Reset Actions */}
            <div className="flex items-center gap-2">
              <button onClick={handleResetData} title={t.resetData} type="button">
                <RotateCcwIcon size={16} />
              </button>
              <button
                onClick={() => setIsRecurringOpen(true)}
                title={t.recurringTasks}
                type="button"
              >
                <RecurringIcon size={16} />
              </button>
            </div>

            {/* Center: Column Segmented Controls */}
            <div className="ui-segmented-control">
              <button
                onClick={() => {
                  setInFocusMode(false);
                  setGridColumnSize(1);
                }}
                className={!inFocusMode && gridColumnSize === 1 ? 'active' : ''}
                type="button"
              >
                1
              </button>
              <button
                onClick={() => {
                  setInFocusMode(false);
                  setGridColumnSize(3);
                }}
                className={!inFocusMode && gridColumnSize === 3 ? 'active' : ''}
                type="button"
              >
                3
              </button>
              <button
                onClick={() => {
                  setInFocusMode(false);
                  setGridColumnSize(5);
                }}
                className={!inFocusMode && gridColumnSize === 5 ? 'active' : ''}
                type="button"
              >
                5
              </button>
              <button
                onClick={() => {
                  setInFocusMode(false);
                  setGridColumnSize(7);
                }}
                className={!inFocusMode && gridColumnSize === 7 ? 'active' : ''}
                type="button"
              >
                7
              </button>
              <button
                onClick={() => setInFocusMode(!inFocusMode)}
                className={inFocusMode ? 'active' : ''}
                title={t.focusMode}
                type="button"
              >
                {t.focusMode}
              </button>
            </div>

            {/* Right: Language toggle, dark mode, Go Pro (disabled), settings */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
                title={t.languageToggle}
                type="button"
                className="text-base leading-none"
              >
                {language === 'pt' ? '🇧🇷' : '🇺🇸'}
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                title={t.toggleDarkMode}
                type="button"
              >
                {darkMode ? <LightModeIcon size={16} /> : <DarkModeIcon size={16} />}
              </button>
              <button
                disabled
                title={t.comingSoon}
                className="ui-button--cta ui-button--dark flex items-center justify-center h-[26px] opacity-50 cursor-default"
                type="button"
              >
                {t.goPro}
              </button>
              <button title={t.settings} type="button">
                <UserIcon size={16} />
              </button>
            </div>
          </div>
        </footer>

        {/* Drag overlay to display floats when moving items */}
        <DragOverlay adjustScale={false}>
          {draggingItem ? (
            <div className="draggable--clone flex items-center w-[204px] px-5 h-[34px] bg-[var(--app-background)] border border-[var(--custom-color)] opacity-90 select-none">
              <div className="todo-content flex items-center w-full gap-2">
                <input
                  type="checkbox"
                  checked={draggingItem.done}
                  readOnly
                  className="todo__checkbox"
                />
                <span className="todo-content__text truncate">{draggingItem.text}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Side Detail Note editor Panel */}
      <NoteSidebar />

      {/* Modal to manage all repeating tasks templates */}
      <RecurringModal isOpen={isRecurringOpen} onClose={() => setIsRecurringOpen(false)} />
    </div>
  );
}
