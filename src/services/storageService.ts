import { StudentProfile, ApplicationTrackerItem, AuthUser } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'scholarfind_student_profile',
  TRACKER: 'scholarfind_application_tracker',
  BOOKMARKS: 'scholarfind_bookmarked_ids',
  AUTH: 'scholarfind_auth_user',
  TOKEN: 'scholarfind_token'
};

export function saveStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  } catch (e) {
    console.error('Failed to save token to storage', e);
  }
}

export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch {
    return null;
  }
}

export function saveStoredAuthUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  } catch (e) {
    console.error('Failed to save auth user to localStorage', e);
  }
}

export function getStoredAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAllAuthSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (e) {
    console.error('Failed to clear auth session', e);
  }
}

export function saveStoredProfile(profile: StudentProfile | null): void {
  try {
    if (profile) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
    }
  } catch (e) {
    console.error('Failed to save profile to localStorage', e);
  }
}

export function getStoredProfile(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored profile', e);
    return null;
  }
}

export function getStoredTracker(): Record<string, ApplicationTrackerItem> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRACKER);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveTrackerItem(item: ApplicationTrackerItem): Record<string, ApplicationTrackerItem> {
  const current = getStoredTracker();
  current[item.scholarshipId] = item;
  try {
    localStorage.setItem(STORAGE_KEYS.TRACKER, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to update tracker', e);
  }
  return current;
}

export function getStoredBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function toggleStoredBookmark(scholarshipId: string): string[] {
  const current = getStoredBookmarks();
  let updated: string[];
  if (current.includes(scholarshipId)) {
    updated = current.filter((id) => id !== scholarshipId);
  } else {
    updated = [...current, scholarshipId];
  }
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save bookmarks', e);
  }
  return updated;
}
