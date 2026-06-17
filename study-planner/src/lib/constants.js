export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function getTodayIndex() {
  return (new Date().getDay() + 6) % 7;
}

export function createInitialTasks() {
  const dayIndex = getTodayIndex();
  return [
    {
      id: "t1",
      title: "Organic chemistry — Chapter 7",
      duration: "45 min block",
      progress: 38,
      missed: false,
      dayIndex,
    },
    {
      id: "t2",
      title: "Calculus problem set",
      duration: "60 min block",
      progress: 12,
      missed: false,
      dayIndex,
    },
    {
      id: "t3",
      title: "History essay outline",
      duration: "30 min sprint",
      progress: 0,
      missed: false,
      dayIndex,
    },
    {
      id: "t4",
      title: "CS: Data structures review",
      duration: "40 min",
      progress: 100,
      missed: false,
      dayIndex,
    },
  ];
}

export const WEEKLY_FOCUS_DEFAULT = [2.2, 3.1, 2.8, 4.2, 3.5, 5.1, 4.4];
