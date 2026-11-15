export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  is_onboarded?: boolean;
  is_admin?: boolean;
  is_suspended?: boolean;
}

export interface Resume {
  id: string;
  title: string;
  user_id?: string;
  profile_id?: string;
  version_number?: number;
  is_active?: boolean;
  template_name?: string;
  content?: {
    contact?: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      website?: string;
      linkedin?: string;
      github?: string;
    };
    basics?: {
      name?: string;
      email?: string;
      summary?: string;
    };
    summary?: string;
    skills?: string[];
    experience?: any[];
    education?: any[];
    projects?: any[];
    certifications?: any[];
  };
  resume_data?: {
    basics?: {
      name?: string;
      email?: string;
      summary?: string;
    };
    contact?: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      website?: string;
      linkedin?: string;
      github?: string;
    };
    summary?: string;
    skills?: string[];
    experience?: any[];
    education?: any[];
    projects?: any[];
    certifications?: any[];
  };
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  roadmap_id: string;
  week_id: string;
  description: string;
  is_completed: boolean;
  order: number;
  created_at: string;
}

export interface Week {
  id: string;
  roadmap_id: string;
  week_number: number;
  title: string;
  tasks: Task[];
}

export interface Roadmap {
  id: string;
  user_id: string;
  goal: string;
  weeks: Week[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string | number;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  created_at: string;
  messages?: Message[];
}
