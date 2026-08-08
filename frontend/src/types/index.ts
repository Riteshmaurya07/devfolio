export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  is_onboarded: boolean;
}

export interface Resume {
  id: string;
  title: string;
  user_id: string;
  resume_data: {
    basics: {
      name: string;
      email: string;
      summary: string;
    };
    experience: any[];
    education: any[];
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
