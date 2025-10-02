export type User = { id: number; name: string };

const KEY = "road_to_ny_user";

export function saveUser(user: User) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function getUser(): User | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearUser() {
  localStorage.removeItem(KEY);
}
