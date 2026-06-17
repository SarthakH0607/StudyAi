import { createInitialTasks, WEEKLY_FOCUS_DEFAULT } from "./constants.js";

const USERS_KEY = "studyflow_users";
const SESSION_KEY = "studyflow_session";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function getUsers() {
  return readJson(USERS_KEY, []);
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

export function signupUser({ name, email, password }) {
  const users = getUsers();
  const normalized = normalizeEmail(email);
  if (!name.trim()) {
    return { ok: false, error: "Please enter your name." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  if (users.some((u) => u.email === normalized)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  users.push({
    name: name.trim(),
    email: normalized,
    password,
  });
  saveUsers(users);
  return { ok: true };
}

export function loginUser(email, password) {
  const normalized = normalizeEmail(email);
  const users = getUsers();
  const u = users.find((x) => x.email === normalized && x.password === password);
  if (!u) {
    return { ok: false, error: "Invalid email or password." };
  }
  return { ok: true, user: { name: u.name, email: u.email } };
}

export function getSession() {
  return readJson(SESSION_KEY, null);
}

export function setSession(user) {
  if (!user) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, name: user.name }));
  }
}

function dataKey(email) {
  return `studyflow_data_${normalizeEmail(email)}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function defaultUserData() {
  return {
    tasks: createInitialTasks(),
    streak: 1,
    lastStreakDate: todayStr(),
    suggestionIndex: 0,
    weeklyFocus: [...WEEKLY_FOCUS_DEFAULT],
  };
}

function applyStreakVisit(data) {
  const today = todayStr();
  let { streak, lastStreakDate } = data;
  if (!lastStreakDate) {
    return { ...data, lastStreakDate: today, streak: streak || 1 };
  }
  if (lastStreakDate === today) {
    return data;
  }
  const last = new Date(`${lastStreakDate}T12:00:00`);
  const t = new Date(`${today}T12:00:00`);
  const diffDays = Math.round((t - last) / 86400000);
  if (diffDays === 1) {
    return { ...data, streak: streak + 1, lastStreakDate: today };
  }
  if (diffDays > 1) {
    return { ...data, streak: 1, lastStreakDate: today };
  }
  return data;
}

export function loadUserData(email) {
  if (!email) return null;
  const raw = readJson(dataKey(email), null);
  if (!raw) return null;
  const merged = { ...defaultUserData(), ...raw };
  return applyStreakVisit(merged);
}

export function saveUserData(email, data) {
  if (!email) return;
  localStorage.setItem(dataKey(email), JSON.stringify(data));
}
