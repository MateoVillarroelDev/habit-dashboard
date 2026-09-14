import { fmt, startOfDay } from "./date";

export const calcStreak = (completions) => {
  let streak = 0;
  const cursor = startOfDay(new Date());
  if (!completions[fmt(cursor)]) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (completions[fmt(cursor)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const calcLongestStreak = (completions) => {
  const dates = Object.keys(completions).sort();
  if (dates.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const diffDays = Math.round((new Date(dates[i]) - new Date(dates[i - 1])) / 86400000);
    current = diffDays === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
};
