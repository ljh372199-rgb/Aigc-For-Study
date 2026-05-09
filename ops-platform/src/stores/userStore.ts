import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  setUsers: (users: User[]) => void;
  setCurrentUser: (user: User | null) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,
  setUsers: (users) => set({ users }),
  setCurrentUser: (currentUser) => set({ currentUser }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, updates) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...updates } : user
      ),
    })),
  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
