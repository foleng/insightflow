export type FieldType = 'input' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number' | 'rating' | 'email' | 'tel' | 'url' | 'image';

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  logic: string;
  logicValue?: string; // The specific value that triggers visibility
}

export interface Section {
  id: string;
  title: string;
  fields: Field[];
}

export interface Schema {
  sections: Section[];
}

export interface Theme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonTextColor: string;
}

export interface SystemSettings {
  systemName: string;
  language: string;
  timezone: string;
  primaryColor: string;
  darkMode: string;
  compactMode: boolean;
  twoFactorAuth: boolean;
  passwordExpiry: string;
  apiToken: string;
  emailNotifications: boolean;
  inAppPopups: boolean;
  feedbackReminder: string;
  // AI Model settings
  aiEnabled: boolean;
  aiProvider: 'gemini' | 'minimax' | 'baidu' | 'tencent';
  geminiApiKey: string;
  minimaxApiKey: string;
  minimaxGroupId: string;
  aiModel: string;
  aiTemperature: number;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  responsesCount: number;
  schema: Schema; // This is the "Draft" schema being edited
  publishedSchema?: Schema; // This is the "Live" schema being filled
  version: number;
  theme?: Theme;
}

export type ViewType = 'dashboard' | 'editor' | 'analytics' | 'settings' | 'fill' | 'ai';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  generatedSurvey: Survey | null;
  createdAt: number;
  updatedAt: number;
}

export type ChatHistoryList = ChatHistory[];