/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Plus, 
  Type, 
  List as ListIcon, 
  CheckCircle, 
  GripHorizontal, 
  ChevronRight, 
  GitBranch, 
  MousePointer2,
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  MoreVertical,
  Search,
  Calendar,
  Users,
  ArrowLeft,
  Save,
  Play,
  Trash2,
  Globe,
  Shield,
  Bell,
  Palette,
  Database,
  Image as ImageIcon,
  Upload,
  LogOut,
  User,
  Lock,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Schema, Section, Field, FieldType, Survey, ViewType, Theme, SystemSettings } from './types';
import { TRANSLATIONS, Language } from './i18n';
import { cn } from './lib/utils';

// --- Mock Data ---
const INITIAL_SURVEYS: Survey[] = [
  {
    id: 's_1',
    title: '员工满意度调查 2024',
    description: '收集员工对办公环境和福利的反馈',
    status: 'published',
    createdAt: '2024-03-15',
    responsesCount: 128,
    version: 1,
    theme: { primaryColor: '#2563eb', backgroundColor: '#ffffff', textColor: '#1e293b', buttonTextColor: '#ffffff' },
    schema: {
      sections: [
        { id: 'sec_1', title: '基本信息', fields: [
          { id: 'f_1', type: 'input', label: '您的部门', required: true, logic: '' },
          { id: 'f_2', type: 'radio', label: '工作年限', required: true, logic: '' }
        ]}
      ]
    }
  },
  {
    id: 's_2',
    title: '新产品用户调研',
    description: '针对 Beta 测试用户的深度访谈问卷',
    status: 'draft',
    createdAt: '2024-03-20',
    responsesCount: 0,
    version: 1,
    theme: { primaryColor: '#7c3aed', backgroundColor: '#fdf4ff', textColor: '#4c1d95', buttonTextColor: '#ffffff' },
    schema: {
      sections: [
        { id: 'sec_1', title: '核心功能评价', fields: [] }
      ]
    }
  }
];

const DEFAULT_THEME = {
  primaryColor: '#2563eb',
  backgroundColor: '#ffffff',
  textColor: '#1e293b',
  buttonTextColor: '#ffffff',
};

const PREDEFINED_PALETTES = [
  { nameKey: 'classicBlue', primary: '#2563eb', bg: '#ffffff', text: '#1e293b', btnText: '#ffffff' },
  { nameKey: 'elegantPurple', primary: '#7c3aed', bg: '#fdf4ff', text: '#4c1d95', btnText: '#ffffff' },
  { nameKey: 'forestGreen', primary: '#059669', bg: '#f0fdf4', text: '#064e3b', btnText: '#ffffff' },
  { nameKey: 'sunsetOrange', primary: '#ea580c', bg: '#fff7ed', text: '#7c2d12', btnText: '#ffffff' },
  { nameKey: 'deepNight', primary: '#3b82f6', bg: '#0f172a', text: '#f8fafc', btnText: '#ffffff' },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string, email: string } | null>(null);
  const [view, setView] = useState<ViewType>('dashboard');
  const [surveys, setSurveys] = useState<Survey[]>(INITIAL_SURVEYS);
  const [activeSurveyId, setActiveSurveyId] = useState<string | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    systemName: "InsightFlow 企业版",
    language: "简体中文",
    timezone: "(GMT+08:00) 北京",
    primaryColor: "#2563eb",
    darkMode: "跟随系统",
    compactMode: false,
    twoFactorAuth: true,
    passwordExpiry: "90 天",
    apiToken: "sk_live_51N8jK...",
    emailNotifications: true,
    inAppPopups: true,
    feedbackReminder: "即时"
  });
  
  // Editor State
  const [selectedSecId, setSelectedSecId] = useState<string | null>(null);
  const [selectedFldId, setSelectedFldId] = useState<string | null>(null);

  // Dark Mode Support
  React.useEffect(() => {
    const root = window.document.documentElement;
    const t = TRANSLATIONS[systemSettings.language as Language] || TRANSLATIONS["简体中文"];
    
    const applyDarkMode = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (systemSettings.darkMode === t.on) {
      applyDarkMode(true);
    } else if (systemSettings.darkMode === t.off) {
      applyDarkMode(false);
    } else {
      // Follow System
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyDarkMode(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        applyDarkMode(e.matches);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [systemSettings.darkMode, systemSettings.language]);

  const activeSurvey = useMemo(() => 
    surveys.find(s => s.id === activeSurveyId) || null
  , [surveys, activeSurveyId]);

  // --- System Handlers ---
  const handleCreateNew = () => {
    const newId = 's_' + Date.now();
    const newSurvey: Survey = {
      id: newId,
      title: '未命名问卷',
      description: '点击此处添加描述',
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      responsesCount: 0,
      schema: { sections: [{ id: 'sec_1', title: '第一章节', fields: [] }] },
      version: 1,
      theme: DEFAULT_THEME
    };
    setSurveys([newSurvey, ...surveys]);
    setActiveSurveyId(newId);
    setView('editor');
  };

  const handleEdit = (id: string) => {
    setActiveSurveyId(id);
    setView('editor');
  };

  const handleViewStats = (id: string) => {
    setActiveSurveyId(id);
    setView('analytics');
  };

  const handleDelete = (id: string) => {
    setSurveys(prev => prev.filter(s => s.id !== id));
    if (activeSurveyId === id) setActiveSurveyId(null);
  };

  // --- Editor Handlers ---
  const updateActiveSurvey = (updates: Partial<Survey>) => {
    if (!activeSurveyId) return;
    setSurveys(prev => prev.map(s => s.id === activeSurveyId ? { ...s, ...updates } : s));
  };

  const updateSchema = (updates: Partial<Schema>) => {
    if (!activeSurvey) return;
    updateActiveSurvey({ schema: { ...activeSurvey.schema, ...updates } });
  };

  const addSection = () => {
    if (!activeSurvey) return;
    const newSec: Section = { id: 'sec_' + Date.now(), title: '新章节', fields: [] };
    updateSchema({ sections: [...activeSurvey.schema.sections, newSec] });
  };

  const onDrop = (e: React.DragEvent, secId: string) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type') as FieldType;
    if (!type || !activeSurvey) return;

    const newFld: Field = {
      id: 'fld_' + Date.now(),
      type,
      label: '新题目',
      required: false,
      logic: ''
    };

    updateSchema({
      sections: activeSurvey.schema.sections.map(s => 
        s.id === secId ? { ...s, fields: [...s.fields, newFld] } : s
      )
    });
    setSelectedSecId(secId);
    setSelectedFldId(newFld.id);
  };

  const t = TRANSLATIONS[systemSettings.language as Language] || TRANSLATIONS["简体中文"];

  if (!isAuthenticated) {
    return <LoginView onLogin={(userData) => {
      setIsAuthenticated(true);
      setUser(userData);
    }} language={systemSettings.language} primaryColor={systemSettings.primaryColor} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 dark:bg-black dark:text-slate-400 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 text-white font-black italic uppercase tracking-tighter">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center not-italic" style={{ backgroundColor: systemSettings.primaryColor }}>
            <Layers className="w-5 h-5" />
          </div>
          <span className="truncate">{systemSettings.systemName}</span>
        </div>

        <nav className="flex-grow px-4 space-y-1">
          <NavItem 
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')}
            icon={<LayoutDashboard className="w-4 h-4" />}
            label={t.dashboard}
            activeColor={systemSettings.primaryColor}
          />
          <NavItem 
            active={view === 'analytics' && !!activeSurveyId} 
            onClick={() => activeSurveyId && setView('analytics')}
            disabled={!activeSurveyId}
            icon={<BarChart3 className="w-4 h-4" />}
            label={t.analytics}
            activeColor={systemSettings.primaryColor}
          />
          <NavItem 
            active={view === 'settings'} 
            onClick={() => setView('settings')}
            icon={<Settings className="w-4 h-4" />}
            label={t.settings}
            activeColor={systemSettings.primaryColor}
          />
        </nav>

        <div className="p-6 border-t border-slate-800 dark:border-slate-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-700 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-600 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              setUser(null);
              setView('dashboard');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="text-xs font-bold">{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <DashboardView 
              surveys={surveys} 
              onCreateNew={handleCreateNew}
              onEdit={handleEdit}
              onViewStats={handleViewStats}
              onDelete={handleDelete}
              onFill={(id: string) => {
                setActiveSurveyId(id);
                setView('fill');
              }}
              primaryColor={systemSettings.primaryColor}
              language={systemSettings.language}
            />
          )}
          
          {view === 'editor' && activeSurvey && (
            <EditorView 
              survey={activeSurvey}
              onBack={() => setView('dashboard')}
              onUpdateSurvey={updateActiveSurvey}
              selectedSecId={selectedSecId}
              setSelectedSecId={setSelectedSecId}
              selectedFldId={selectedFldId}
              setSelectedFldId={setSelectedFldId}
              addSection={addSection}
              onDrop={onDrop}
              primaryColor={systemSettings.primaryColor}
              language={systemSettings.language}
            />
          )}

          {view === 'analytics' && activeSurvey && (
            <AnalyticsView 
              survey={activeSurvey} 
              onBack={() => setView('dashboard')}
              primaryColor={systemSettings.primaryColor}
              language={systemSettings.language}
            />
          )}

          {view === 'fill' && activeSurvey && (
            <SurveyFillView 
              survey={activeSurvey} 
              onBack={() => setView('dashboard')}
              onSubmit={(data: any) => {
                console.log('Survey Submitted:', data);
                setView('dashboard');
              }}
              language={systemSettings.language}
            />
          )}

          {view === 'settings' && (
            <SettingsView settings={systemSettings} onUpdate={setSystemSettings} language={systemSettings.language} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function LoginView({ onLogin, language, primaryColor }: { onLogin: (user: { name: string, email: string }) => void, language: string, primaryColor: string }) {
  const t = TRANSLATIONS[language as Language] || TRANSLATIONS["简体中文"];
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Mock login logic
    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        onLogin({ name: 'Administrator', email: 'admin@surveypro.com' });
      } else {
        setError(t.invalidCredentials);
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-100 dark:border-slate-800 overflow-hidden"
      >
        <div className="p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6" style={{ backgroundColor: primaryColor }}>
              <Layers className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">InsightFlow</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enterprise Edition</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-200">{t.login}</h2>
            <p className="text-sm text-slate-400 mt-1">{t.loginDesc}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">{t.username}</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">{t.password}</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-bold text-red-500 ml-1"
              >
                {error}
              </motion.p>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl text-white font-black text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t.login}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            © 2024 InsightFlow Enterprise • Secure Access
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// --- Views ---

function DashboardView({ surveys, onCreateNew, onEdit, onViewStats, onDelete, onFill, primaryColor, language }: any) {
  const t = TRANSLATIONS[language as Language] || TRANSLATIONS["简体中文"];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex-grow flex flex-col p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{t.dashboard}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.dashboardDesc}</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="px-6 py-3 text-white rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center gap-2"
          style={{ 
            backgroundColor: primaryColor,
            boxShadow: `0 10px 15px -3px ${primaryColor}33`
          }}
        >
          <Plus className="w-4 h-4" /> {t.createNew}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map((survey: Survey) => (
          <div key={survey.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                survey.status === 'published' ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : 
                survey.status === 'draft' ? "bg-slate-100 text-slate-50 dark:bg-slate-800 dark:text-slate-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              )}>
                {survey.status === 'published' ? t.published : survey.status === 'draft' ? t.draft : t.closed}
              </span>
              <div className="flex gap-2">
                {survey.status === 'published' && (
                  <button 
                    onClick={() => onFill(survey.id)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: primaryColor }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${primaryColor}11`}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="填写问卷"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}
                <button className="text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 
              className="text-lg font-bold mb-2 transition-colors text-slate-900 dark:text-slate-100"
              style={{ color: 'inherit' }}
              onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
              onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
            >
              {survey.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase">{t.version} V{survey.version || 1}</span>
              {survey.publishedSchema && <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />}
              {survey.publishedSchema && (
                <span className="text-[10px] font-bold uppercase" style={{ color: primaryColor }}>
                  {t.onlineLocked}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mb-6 h-8">{survey.description}</p>
            
            <div className="flex items-center gap-4 mb-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Users className="w-3 h-3" /> {survey.responsesCount} {t.responses}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> {survey.createdAt}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => onEdit(survey.id)}
                className="flex-grow py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${primaryColor}11`;
                  e.currentTarget.style.color = primaryColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = '';
                }}
              >
                {t.editSurvey}
              </button>
              <button 
                onClick={() => onViewStats(survey.id)}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${primaryColor}11`;
                  e.currentTarget.style.color = primaryColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = '';
                }}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(survey.id)}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SurveyFillView({ survey, onBack, onSubmit, language }: any) {
  const t = TRANSLATIONS[language as Language] || TRANSLATIONS["简体中文"];
  const [formData, setFormData] = useState<Record<string, any>>({});
  const activeSchema = survey.publishedSchema || survey.schema;
  const theme = survey.theme || DEFAULT_THEME;

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const isFieldVisible = (field: Field) => {
    if (!field.logic) return true;
    const targetValue = formData[field.logic];
    if (!field.logicValue) return !!targetValue;
    return targetValue === field.logicValue;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-grow flex flex-col overflow-y-auto"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <div className="max-w-3xl mx-auto w-full py-20 px-6">
        <button 
          onClick={onBack} 
          className="mb-8 flex items-center gap-2 transition-colors text-xs font-bold uppercase tracking-widest"
          style={{ color: theme.textColor + '80' }}
        >
          <ArrowLeft className="w-4 h-4" /> 返回管理页
        </button>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-black">{survey.title}</h1>
            <span 
              className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
              style={{ backgroundColor: theme.primaryColor + '15', color: theme.primaryColor }}
            >
              V{survey.version || 1}
            </span>
          </div>
          <p className="text-lg opacity-70">{survey.description}</p>
        </div>

        <div className="space-y-16">
          {activeSchema.sections.map((sec: Section) => (
            <div key={sec.id} className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-black shrink-0">{sec.title}</h2>
                <div className="h-px flex-grow" style={{ backgroundColor: theme.textColor + '15' }} />
              </div>

              <div className="space-y-10">
                {sec.fields.map((f: Field) => {
                  if (!isFieldVisible(f)) return null;

                  return (
                    <div key={f.id} className="space-y-4">
                      <label className="block text-sm font-bold opacity-90">
                        {f.label} {f.required && <span className="text-red-500">*</span>}
                      </label>
                      
                      {f.type === 'input' && (
                        <input 
                          type="text" 
                          placeholder={t.inputPlaceholder}
                          className="w-full p-4 border rounded-2xl outline-none transition-all"
                          style={{ 
                            backgroundColor: theme.backgroundColor === '#ffffff' ? '#f8fafc' : theme.backgroundColor,
                            borderColor: theme.textColor + '15',
                            color: theme.textColor
                          }}
                          value={formData[f.id] || ''}
                          onChange={(e) => handleInputChange(f.id, e.target.value)}
                        />
                      )}

                      {f.type === 'select' && (
                        <select 
                          className="w-full p-4 border rounded-2xl outline-none transition-all appearance-none"
                          style={{ 
                            backgroundColor: theme.backgroundColor === '#ffffff' ? '#f8fafc' : theme.backgroundColor,
                            borderColor: theme.textColor + '15',
                            color: theme.textColor
                          }}
                          value={formData[f.id] || ''}
                          onChange={(e) => handleInputChange(f.id, e.target.value)}
                        >
                          <option value="">{t.selectPlaceholder}</option>
                          <option value="opt1">{t.optionA}</option>
                          <option value="opt2">{t.optionB}</option>
                          <option value="opt3">{t.optionC}</option>
                        </select>
                      )}

                      {f.type === 'radio' && (
                        <div className="space-y-3">
                          {[t.optionA, t.optionB, t.optionC].map((opt, idx) => (
                            <label 
                              key={idx} 
                              className="flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all"
                              style={{ 
                                backgroundColor: formData[f.id] === opt ? theme.primaryColor + '10' : (theme.backgroundColor === '#ffffff' ? '#f8fafc' : theme.backgroundColor),
                                borderColor: formData[f.id] === opt ? theme.primaryColor : theme.textColor + '15'
                              }}
                            >
                              <input 
                                type="radio" 
                                name={f.id}
                                className="w-5 h-5"
                                style={{ accentColor: theme.primaryColor }}
                                checked={formData[f.id] === opt}
                                onChange={() => handleInputChange(f.id, opt)}
                              />
                              <span className="text-sm font-medium opacity-80">{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {f.type === 'image' && (
                        <div className="space-y-4">
                          <div className="relative group">
                            <input 
                              type="file" 
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    handleInputChange(f.id, reader.result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <div 
                              className="w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all"
                              style={{ 
                                backgroundColor: theme.backgroundColor === '#ffffff' ? '#f8fafc' : theme.backgroundColor,
                                borderColor: theme.textColor + '15'
                              }}
                            >
                              {formData[f.id] ? (
                                <div className="relative w-full px-10">
                                  <img 
                                    src={formData[f.id]} 
                                    alt="Preview" 
                                    className="max-h-48 mx-auto rounded-xl shadow-lg"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl">
                                    <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full">{t.changeImage}</span>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div 
                                    className="w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center transition-colors"
                                    style={{ backgroundColor: theme.backgroundColor, color: theme.textColor + '40' }}
                                  >
                                    <Upload className="w-6 h-6" />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm font-bold opacity-80">{t.uploadImage}</p>
                                    <p className="text-[10px] opacity-40 mt-1 uppercase tracking-widest">{t.uploadDesc}</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-10 border-t" style={{ borderColor: theme.textColor + '15' }}>
          <button 
            onClick={() => onSubmit(formData)}
            className="w-full py-5 rounded-[2rem] font-black text-lg shadow-2xl transition-all transform hover:-translate-y-1"
            style={{ 
              backgroundColor: theme.primaryColor, 
              color: theme.buttonTextColor,
              boxShadow: `0 20px 40px ${theme.primaryColor}33`
            }}
          >
            {t.submitSurvey}
          </button>
          <p className="text-center text-[10px] mt-6 uppercase tracking-widest font-bold opacity-30">
            Powered by InsightFlow LowCode Engine
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function EditorView({ 
  survey, 
  onBack, 
  onUpdateSurvey, 
  selectedSecId, 
  setSelectedSecId, 
  selectedFldId, 
  setSelectedFldId,
  addSection,
  onDrop,
  primaryColor,
  language
}: any) {
  const t = TRANSLATIONS[language as Language] || TRANSLATIONS["简体中文"];
  const [leftTab, setLeftTab] = useState<'components' | 'theme'>('components');
  const currentSection = survey.schema.sections.find((s: any) => s.id === selectedSecId);
  const currentField = currentSection?.fields.find((f: any) => f.id === selectedFldId);

  const updateField = (secId: string, fldId: string, updates: Partial<Field>) => {
    onUpdateSurvey({
      schema: {
        ...survey.schema,
        sections: survey.schema.sections.map((s: any) => 
          s.id === secId 
            ? { ...s, fields: s.fields.map((f: any) => f.id === fldId ? { ...f, ...updates } : f) } 
            : s
        )
      }
    });
  };

  const updateSection = (secId: string, updates: Partial<Section>) => {
    onUpdateSurvey({
      schema: {
        ...survey.schema,
        sections: survey.schema.sections.map((s: any) => s.id === secId ? { ...s, ...updates } : s)
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      {/* Editor Header */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <input 
            type="text" 
            value={survey.title}
            onChange={(e) => onUpdateSurvey({ title: e.target.value })}
            className="text-sm font-bold bg-transparent border-none outline-none focus:ring-0 w-64"
          />
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onBack}
            className="px-4 py-2 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {t.saveDraft}
          </button>
          <button 
            onClick={() => {
              onUpdateSurvey({ 
                status: 'published',
                publishedSchema: JSON.parse(JSON.stringify(survey.schema)),
                version: (survey.version || 1) + 1
              });
              onBack();
            }}
            className="px-6 py-2 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
            style={{ 
              backgroundColor: primaryColor,
              boxShadow: `0 10px 15px -3px ${primaryColor}33`
            }}
          >
            <Play className="w-4 h-4" /> {t.publishNew}
          </button>
        </div>
      </header>

      <div className="flex-grow flex overflow-hidden">
        {/* Left: Components & Theme */}
        <aside className="w-64 bg-white border-r border-slate-100 flex flex-col overflow-hidden">
          <div className="flex border-b">
            <button 
              onClick={() => setLeftTab('components')}
              className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
                leftTab === 'components' ? "border-b-2" : "text-slate-400 hover:text-slate-600"
              )}
              style={leftTab === 'components' ? { color: primaryColor, borderBottomColor: primaryColor } : {}}
            >
              {t.components}
            </button>
            <button 
              onClick={() => setLeftTab('theme')}
              className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
                leftTab === 'theme' ? "border-b-2" : "text-slate-400 hover:text-slate-600"
              )}
              style={leftTab === 'theme' ? { color: primaryColor, borderBottomColor: primaryColor } : {}}
            >
              {t.theme}
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6">
            {leftTab === 'components' ? (
              <>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{t.draggableComponents}</h3>
                <div className="space-y-3">
                  <DraggableItem type="input" label={t.singleLineInput} icon={<Type className="w-4 h-4" />} onDragStart={(e, t) => e.dataTransfer.setData('type', t)} primaryColor={primaryColor} />
                  <DraggableItem type="select" label={t.dropdownSelect} icon={<ListIcon className="w-4 h-4" />} onDragStart={(e, t) => e.dataTransfer.setData('type', t)} primaryColor={primaryColor} />
                  <DraggableItem type="radio" label={t.radioSelect} icon={<CheckCircle className="w-4 h-4" />} onDragStart={(e, t) => e.dataTransfer.setData('type', t)} primaryColor={primaryColor} />
                  <DraggableItem type="image" label={t.imageUpload} icon={<ImageIcon className="w-4 h-4" />} onDragStart={(e, t) => e.dataTransfer.setData('type', t)} primaryColor={primaryColor} />
                </div>
              </>
            ) : (
              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.presetPalettes}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {PREDEFINED_PALETTES.map(p => (
                      <button 
                        key={p.nameKey}
                        onClick={() => onUpdateSurvey({ theme: { primaryColor: p.primary, backgroundColor: p.bg, textColor: p.text, buttonTextColor: p.btnText } })}
                        className="p-2 border border-slate-100 rounded-xl transition-all text-left group"
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = primaryColor}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                      >
                        <div className="flex gap-1 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.primary }} />
                          <div className="w-3 h-3 rounded-full border border-slate-100" style={{ backgroundColor: p.bg }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 transition-colors" style={{ color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.color = primaryColor} onMouseLeave={(e) => e.currentTarget.style.color = ''}>{t[p.nameKey as keyof typeof t]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.customColors}</h3>
                  {[
                    { label: t.primaryColor, key: 'primaryColor' },
                    { label: t.backgroundColor, key: 'backgroundColor' },
                    { label: t.textColor, key: 'textColor' },
                    { label: t.buttonTextColor, key: 'buttonTextColor' },
                  ].map(c => (
                    <div key={c.key} className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">{c.label}</span>
                      <input 
                        type="color" 
                        value={survey.theme?.[c.key as keyof Theme] || '#000000'}
                        onChange={(e) => onUpdateSurvey({ theme: { ...survey.theme, [c.key]: e.target.value } })}
                        className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center: Canvas */}
        <main 
          className="flex-grow p-10 overflow-y-auto space-y-10 bg-slate-50"
          onClick={() => { setSelectedSecId(null); setSelectedFldId(null); }}
        >
          {survey.schema.sections.map((sec: any) => (
            <SectionComponent 
              key={sec.id}
              section={sec}
              isSelected={selectedSecId === sec.id && !selectedFldId}
              selectedFldId={selectedFldId}
              onSelect={() => { setSelectedSecId(sec.id); setSelectedFldId(null); }}
              onDrop={(e) => onDrop(e, sec.id)}
              onFieldSelect={(fldId) => { setSelectedSecId(sec.id); setSelectedFldId(fldId); }}
              primaryColor={primaryColor}
            />
          ))}
          <button 
            onClick={addSection}
            className="w-full py-6 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-slate-400 font-bold text-sm transition-all flex items-center justify-center gap-2"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = primaryColor;
              e.currentTarget.style.color = primaryColor;
              e.currentTarget.style.backgroundColor = `${primaryColor}08`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '';
              e.currentTarget.style.color = '';
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            <Plus className="w-5 h-5" /> {t.addNewSection}
          </button>
        </main>

        {/* Right: Properties */}
        <aside className="w-80 bg-white border-l border-slate-100 p-6 overflow-y-auto">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">{t.propertiesPanel}</h3>
          <AnimatePresence mode="wait">
            {!selectedSecId ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-slate-300">
                <MousePointer2 className="w-10 h-10 mx-auto mb-4 opacity-20" />
                <p className="text-xs">{t.clickToConfigure}</p>
              </motion.div>
            ) : selectedFldId && currentField ? (
              <motion.div key="field" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="p-3 rounded-xl text-[10px] font-black uppercase" style={{ backgroundColor: `${primaryColor}11`, color: primaryColor }}>{t.editField}</div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">{t.fieldName}</label>
                  <input 
                    type="text" 
                    value={currentField.label}
                    onChange={(e) => updateField(selectedSecId, selectedFldId, { label: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl outline-none text-sm transition-all"
                    style={{ focusRing: `2px ${primaryColor}20` } as any}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <span className="text-xs font-bold">{t.isRequired}</span>
                  <input 
                    type="checkbox" 
                    checked={currentField.required}
                    onChange={(e) => updateField(selectedSecId, selectedFldId, { required: e.target.checked })}
                    className="w-5 h-5"
                    style={{ accentColor: primaryColor }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase block mb-2" style={{ color: primaryColor }}>{t.logicJump}</label>
                  <div className="space-y-2">
                    <select 
                      value={currentField.logic}
                      onChange={(e) => updateField(selectedSecId, selectedFldId, { logic: e.target.value, logicValue: '' })}
                      className="w-full p-3 bg-slate-50 border rounded-xl text-xs outline-none"
                    >
                      <option value="">{t.alwaysShow}</option>
                      {currentSection?.fields.filter((f: any) => f.id !== selectedFldId && (f.type === 'radio' || f.type === 'select')).map((f: any) => (
                        <option key={f.id} value={f.id}>{t.dependsOn}: {f.label}</option>
                      ))}
                    </select>

                    {currentField.logic && (
                      <select 
                        value={currentField.logicValue}
                        onChange={(e) => updateField(selectedSecId, selectedFldId, { logicValue: e.target.value })}
                        className="w-full p-3 border rounded-xl text-xs outline-none"
                        style={{ backgroundColor: `${primaryColor}11`, borderColor: `${primaryColor}22`, color: primaryColor }}
                      >
                        <option value="">{t.selectTriggerValue}</option>
                        {[t.optionA, t.optionB, t.optionC].map(opt => (
                          <option key={opt} value={opt}>{t.showWhenAnswerIs.replace('{val}', opt)}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : currentSection ? (
              <motion.div key="section" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="p-3 rounded-xl text-[10px] font-black uppercase" style={{ backgroundColor: `${primaryColor}11`, color: primaryColor }}>{t.editSection}</div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">{t.sectionTitle}</label>
                  <input 
                    type="text" 
                    value={currentSection.title}
                    onChange={(e) => updateSection(selectedSecId, { title: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl outline-none text-sm transition-all"
                    style={{ focusRing: `2px ${primaryColor}20` } as any}
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </aside>
      </div>
    </motion.div>
  );
}

function AnalyticsView({ survey, onBack, primaryColor, language }: any) {
  const t = TRANSLATIONS[language as Language] || TRANSLATIONS["简体中文"];
  const COLORS = [primaryColor, '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  // Generate dynamic stats based on survey fields
  const allFields = useMemo(() => {
    return survey.schema.sections.flatMap((s: any) => s.fields);
  }, [survey]);

  const statsData = useMemo(() => {
    // Pick first 2 fields for charts
    const chartFields = allFields.filter((f: any) => f.type === 'select' || f.type === 'radio').slice(0, 2);
    
    const generateData = (field: any) => {
      const options = ['选项 A', '选项 B', '选项 C', '选项 D', '其他'];
      return options.slice(0, 4).map(opt => ({
        name: opt,
        value: Math.floor(Math.random() * 50) + 10
      }));
    };

    return {
      bar: chartFields[0] ? {
        title: chartFields[0].label,
        data: generateData(chartFields[0])
      } : {
        title: '暂无数据',
        data: [{ name: '无', value: 0 }]
      },
      pie: chartFields[1] ? {
        title: chartFields[1].label,
        data: generateData(chartFields[1])
      } : {
        title: '暂无数据',
        data: [{ name: '无', value: 0 }]
      }
    };
  }, [allFields]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-grow flex flex-col p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{survey.title} - {t.analytics}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.responsesCount.replace('{count}', survey.responsesCount)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">{statsData.bar.title}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData.bar.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill={primaryColor} radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">{statsData.pie.title}</h3>
          <div className="h-64 w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statsData.pie.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statsData.pie.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-48 space-y-2">
              {statsData.pie.data.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto">{item.value} 票</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">{t.detailedFeedback}</h3>
        <div className="space-y-4">
          {allFields.slice(0, 5).map((f: any, i: number) => (
            <div key={f.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black shadow-sm" style={{ color: primaryColor }}>{i + 1}</div>
                <div>
                  <p className="text-xs font-bold">{f.label}</p>
                  <p className="text-[10px] text-slate-400">
                    {f.type === 'input' ? '文本回复统计' : 
                     f.type === 'image' ? '图片上传统计' :
                     `平均得分: ${(Math.random() * 2 + 3).toFixed(1)} / 5.0`}
                  </p>
                </div>
              </div>
              <button 
                className="text-[10px] font-black uppercase tracking-widest hover:underline"
                style={{ color: primaryColor }}
              >
                查看详情
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// --- Shared Components ---

function NavItem({ active, onClick, icon, label, disabled, activeColor }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
        active ? "text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
        disabled && "opacity-30 cursor-not-allowed"
      )}
      style={active ? { 
        backgroundColor: activeColor,
        boxShadow: `0 10px 15px -3px ${activeColor}33` 
      } : {}}
    >
      {icon}
      {label}
    </button>
  );
}

function DraggableItem({ type, label, icon, onDragStart, primaryColor }: any) {
  return (
    <div 
      draggable 
      onDragStart={(e) => onDragStart(e, type)}
      className="p-4 border border-slate-100 rounded-2xl cursor-grab flex items-center gap-3 transition-all group"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `${primaryColor}08`;
        e.currentTarget.style.borderColor = `${primaryColor}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '';
        e.currentTarget.style.borderColor = '';
      }}
    >
      <span className="text-slate-300 transition-colors group-hover:text-blue-400" style={{ color: 'inherit' }}>{icon}</span>
      <span className="text-xs font-bold">{label}</span>
    </div>
  );
}

function SectionComponent({ section, isSelected, selectedFldId, onSelect, onDrop, onFieldSelect, primaryColor }: any) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={cn(
        "bg-white p-8 rounded-[2.5rem] shadow-sm border-2 transition-all cursor-default"
      )}
      style={{ 
        borderColor: isSelected ? primaryColor : 'transparent',
        boxShadow: isSelected ? `0 0 0 4px ${primaryColor}11` : ''
      }}
    >
      <div className="flex justify-between items-center mb-6 pointer-events-none">
        <h2 className="text-xl font-black text-slate-800">{section.title}</h2>
        <GripHorizontal className="text-slate-200" />
      </div>
      
      <div 
        className={cn(
          "min-h-[120px] border-2 border-dashed rounded-3xl p-4 space-y-3 transition-all",
          !isDragOver && "border-slate-100"
        )}
        style={isDragOver ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` } : {}}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { setIsDragOver(false); onDrop(e); }}
      >
        {section.fields.length === 0 && (
          <div className="text-center py-12 text-slate-300 text-[10px] font-black uppercase tracking-widest">
            拖入组件开始设计
          </div>
        )}
        
        {section.fields.map((f: any) => (
          <div 
            key={f.id}
            onClick={(e) => { e.stopPropagation(); onFieldSelect(f.id); }}
            className={cn(
              "p-5 bg-white border rounded-2xl flex justify-between items-center transition-all cursor-pointer shadow-sm hover:shadow-md"
            )}
            style={{ 
              borderColor: selectedFldId === f.id ? primaryColor : '',
              boxShadow: selectedFldId === f.id ? `0 0 0 4px ${primaryColor}11` : ''
            }}
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 uppercase font-mono tracking-tighter">
                {f.type} • {f.id}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {f.logic && <GitBranch className="w-3 h-3 text-indigo-500" />}
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView({ settings, onUpdate, language }: { settings: SystemSettings, onUpdate: (s: SystemSettings) => void, language: string }) {
  const t = TRANSLATIONS[language as Language] || TRANSLATIONS["简体中文"];
  const [localSettings, setLocalSettings] = useState(settings);

  const settingsGroups = [
    {
      title: t.general,
      icon: <Globe className="w-4 h-4" />,
      items: [
        { label: t.systemName, value: localSettings.systemName, type: "text", key: 'systemName' },
        { label: t.language, value: localSettings.language, type: "select", options: ["简体中文", "繁體中文", "English", "日本語"], key: 'language' },
        { label: t.timezone, value: localSettings.timezone, type: "select", options: [t.beijing, t.london, t.newYork], key: 'timezone' }
      ]
    },
    {
      title: t.appearance,
      icon: <Palette className="w-4 h-4" />,
      items: [
        { label: t.primaryColor, value: localSettings.primaryColor, type: "color", key: 'primaryColor' },
        { label: t.darkMode, value: localSettings.darkMode, type: "select", options: [t.on, t.off, t.followSystem], key: 'darkMode' },
        { label: t.compactMode, value: localSettings.compactMode, type: "toggle", key: 'compactMode' }
      ]
    },
    {
      title: t.security,
      icon: <Shield className="w-4 h-4" />,
      items: [
        { label: t.twoFactorAuth, value: localSettings.twoFactorAuth, type: "toggle", key: 'twoFactorAuth' },
        { label: t.passwordExpiry, value: localSettings.passwordExpiry, type: "select", options: [t.days30, t.days90, t.neverExpire], key: 'passwordExpiry' },
        { label: t.apiToken, value: localSettings.apiToken, type: "password", key: 'apiToken' }
      ]
    },
    {
      title: t.notifications,
      icon: <Bell className="w-4 h-4" />,
      items: [
        { label: t.emailNotifications, value: localSettings.emailNotifications, type: "toggle", key: 'emailNotifications' },
        { label: t.inAppPopups, value: localSettings.inAppPopups, type: "toggle", key: 'inAppPopups' },
        { label: t.feedbackReminder, value: localSettings.feedbackReminder, type: "select", options: [t.instant, t.dailySummary, t.weeklySummary], key: 'feedbackReminder' }
      ]
    }
  ];

  const handleUpdate = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-grow p-10 overflow-y-auto bg-slate-50 dark:bg-slate-950"
    >
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{t.settings}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t.settingsDesc}</p>
        </header>

        <div className="space-y-8">
          {settingsGroups.map((group, idx) => (
            <section key={idx} className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm" style={{ color: localSettings.primaryColor }}>
                  {group.icon}
                </div>
                <h2 className="font-bold text-slate-800 dark:text-slate-200">{group.title}</h2>
              </div>
              <div className="p-8 space-y-6">
                {group.items.map((item, iidx) => (
                  <div key={iidx} className="flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider font-medium">System Configuration Parameter</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {item.type === 'toggle' ? (
                        <button 
                          onClick={() => handleUpdate(item.key, !item.value)}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            !item.value && "bg-slate-200 dark:bg-slate-700"
                          )}
                          style={item.value ? { backgroundColor: localSettings.primaryColor } : {}}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            item.value ? "left-7" : "left-1"
                          )} />
                        </button>
                      ) : item.type === 'select' ? (
                        <select 
                          value={item.value as string}
                          onChange={(e) => handleUpdate(item.key, e.target.value)}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none transition-all"
                          style={{ focusRing: `2px ${localSettings.primaryColor}20` } as any}
                        >
                          {item.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : item.type === 'color' ? (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase">{item.value as string}</span>
                          <input 
                            type="color"
                            value={item.value as string}
                            onChange={(e) => handleUpdate(item.key, e.target.value)}
                            className="w-8 h-8 rounded-xl shadow-inner cursor-pointer border-none p-0 bg-transparent"
                          />
                        </div>
                      ) : (
                        <input 
                          type={item.type} 
                          value={item.value as string}
                          onChange={(e) => handleUpdate(item.key, e.target.value)}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none transition-all text-right"
                          style={{ focusRing: `2px ${localSettings.primaryColor}20` } as any}
                        />
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 flex justify-end gap-4">
          <button 
            onClick={() => setLocalSettings(settings)}
            className="px-8 py-4 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-2xl transition-all"
          >
            {t.cancel}
          </button>
          <button 
            onClick={() => onUpdate(localSettings)}
            className="px-10 py-4 text-white font-bold text-sm rounded-2xl shadow-xl transition-all"
            style={{ backgroundColor: localSettings.primaryColor, boxShadow: `0 20px 25px -5px ${localSettings.primaryColor}33` }}
          >
            {t.saveSettings}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
