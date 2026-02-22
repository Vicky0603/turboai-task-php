export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  color: "peach" | "yellow" | "mint";
  notes_count: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: number;
  category_name: string;
  category_color: string;
  created_at: string;
  updated_at: string;
}

export interface NoteDetail extends Note {
  category_details: Category;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}
