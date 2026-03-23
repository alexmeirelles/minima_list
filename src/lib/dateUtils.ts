export const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getWeekDays = (startDate: Date): Date[] => {
  const days: Date[] = [];
  const day = startDate.getDay();
  const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(startDate);
  monday.setDate(diff);

  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    days.push(nextDay);
  }
  return days;
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

export const formatDisplayDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

export const formatDayName = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
};

export const formatWeekRange = (weekDays: Date[]): string => {
  if (!weekDays || weekDays.length === 0) return '';
  const start = weekDays[0];
  const end = weekDays[6];
  const startStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(start);
  const endStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(end);
  return `${startStr} - ${endStr}`;
};

export const isCurrentWeek = (weekDays: Date[]): boolean => {
  const today = new Date();
  return weekDays.some((d) => isSameDay(d, today));
};
