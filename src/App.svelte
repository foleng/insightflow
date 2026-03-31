<script lang="ts">
  import './app.css';
  import { writable, derived } from 'svelte/store';
  import { 
    Layers, 
    LayoutDashboard,
    BarChart3,
    Settings,
    LogOut,
    User
  } from 'lucide-svelte';
  import type { Schema, Section, Field, FieldType, Survey, ViewType, Theme, SystemSettings } from './types';
  import { TRANSLATIONS } from './i18n';
  import type { Language } from './i18n';
  
  // Import components
  import LoginView from './components/LoginView.svelte';
  import DashboardView from './components/DashboardView.svelte';
  import EditorView from './components/EditorView.svelte';
  import AnalyticsView from './components/AnalyticsView.svelte';
  import SurveyFillView from './components/SurveyFillView.svelte';
  import SettingsView from './components/SettingsView.svelte';
  import NavItem from './components/NavItem.svelte';
  
  // Import Gun.js
  import Gun from 'gun';
  import 'gun/sea';

  // Initialize Gun.js
  const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
  const userInstance = gun.user();

  // Store setup
  const isAuthenticated = writable(false);
  const user = writable<{ name: string; email: string; pub: string } | null>(null);
  const view = writable<ViewType>('dashboard');
  const surveys = writable<Survey[]>([]);
  const activeSurveyId = writable<string | null>(null);
  const systemSettings = writable<SystemSettings>({
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
  const selectedSecId = writable<string | null>(null);
  const selectedFldId = writable<string | null>(null);

  // Derived stores
  const activeSurvey = derived([surveys, activeSurveyId], ([$surveys, $activeSurveyId]) => {
    return $surveys.find(s => s.id === $activeSurveyId) || null;
  });

  const t_store = derived(systemSettings, ($systemSettings) => {
    return TRANSLATIONS[$systemSettings.language as Language] || TRANSLATIONS["简体中文"];
  });

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
      theme: {
        primaryColor: '#2563eb',
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        buttonTextColor: '#ffffff',
      }
    };
    surveys.update(prev => [newSurvey, ...prev]);
    activeSurveyId.set(newId);
    view.set('editor');
    
    // Save to Gun.js if authenticated
    if ($isAuthenticated && $user) {
      userInstance.get('surveys').get(newId).put(newSurvey);
    }
  };

  const handleEdit = (id: string) => {
    activeSurveyId.set(id);
    view.set('editor');
  };

  const handleViewStats = (id: string) => {
    activeSurveyId.set(id);
    view.set('analytics');
  };

  const handleDelete = (id: string) => {
    surveys.update(prev => prev.filter(s => s.id !== id));
    activeSurveyId.update(prev => prev === id ? null : prev);
    
    // Delete from Gun.js if authenticated
    if ($isAuthenticated && $user) {
      userInstance.get('surveys').get(id).put(null);
    }
  };

  const handleFill = (id: string) => {
    activeSurveyId.set(id);
    view.set('fill');
  };

  // --- Editor Handlers ---
  const updateActiveSurvey = (updates: Partial<Survey>) => {
    const currentActiveId = $activeSurveyId;
    if (!currentActiveId) return;
    surveys.update(prev => prev.map(s => s.id === currentActiveId ? { ...s, ...updates } : s));
    
    // Save to Gun.js if authenticated
    if ($isAuthenticated && $user) {
      const updatedSurvey = $surveys.find(s => s.id === currentActiveId);
      if (updatedSurvey) {
        userInstance.get('surveys').get(currentActiveId).put(updatedSurvey);
      }
    }
  };

  const updateSchema = (updates: Partial<Schema>) => {
    const currentActive = $activeSurvey;
    if (!currentActive) return;
    updateActiveSurvey({ schema: { ...currentActive.schema, ...updates } });
  };

  const addSection = () => {
    const currentActive = $activeSurvey;
    if (!currentActive) return;
    const newSec: Section = { id: 'sec_' + Date.now(), title: '新章节', fields: [] };
    updateSchema({ sections: [...currentActive.schema.sections, newSec] });
  };

  const onDrop = (e: DragEvent, secId: string) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type') as FieldType;
    if (!type || !$activeSurvey) return;

    const newFld: Field = {
      id: 'fld_' + Date.now(),
      type,
      label: '新题目',
      required: false,
      logic: ''
    };

    updateSchema({
      sections: $activeSurvey.schema.sections.map(s => 
        s.id === secId ? { ...s, fields: [...s.fields, newFld] } : s
      )
    });
    selectedSecId.set(secId);
    selectedFldId.set(newFld.id);
  };

  // Login handler
  const handleLogin = (userData: { name: string; pub: string }) => {
    isAuthenticated.set(true);
    user.set({ name: userData.name, email: userData.pub, pub: userData.pub });
    
    // Load surveys from Gun.js
    userInstance.get('surveys').map().on((survey: any, id: string) => {
      if (survey) {
        surveys.update(prev => {
          const existingIndex = prev.findIndex(s => s.id === id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = survey as Survey;
            return updated;
          }
          return [...prev, survey as Survey];
        });
      }
    });
  };

  // Logout handler
  const handleLogout = () => {
    isAuthenticated.set(false);
    user.set(null);
    userInstance.leave();
    surveys.set([]);
    view.set('dashboard');
  };
  
  // Check if already logged in
  userInstance.recall({ sessionStorage: true }, (ack: any) => {
    if (ack.err) {
      console.log('Not logged in');
    } else if (ack.is) {
      handleLogin(ack.is);
    }
  });
</script>

<style>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>

<div class="flex h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
  {#if !$isAuthenticated}
    <!-- Login View -->
    <LoginView 
      onLogin={handleLogin}
      language={$systemSettings.language}
      primaryColor={$systemSettings.primaryColor}
    />
  {:else}
        <!-- Sidebar Navigation -->
        <aside class="w-64 bg-slate-900 text-slate-300 dark:bg-black dark:text-slate-400 flex flex-col shrink-0">
          <div class="p-6 flex items-center gap-3 text-white font-black italic uppercase tracking-tighter">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center not-italic" style={{ backgroundColor: $systemSettings.primaryColor }}>
              <Layers class="text-white w-5 h-5" />
            </div>
            <span class="truncate">{$systemSettings.systemName}</span>
          </div>

          <nav class="flex-grow px-4 space-y-1">
            <NavItem
              active={$view === 'dashboard'}
              label={$t_store.dashboard}
              activeColor={$systemSettings.primaryColor}
              onclick={() => view.set('dashboard')}
            >
              <LayoutDashboard slot="icon" class="w-4 h-4" />
            </NavItem>
            <NavItem
              active={$view === 'analytics' && !!$activeSurveyId}
              label={$t_store.analytics}
              activeColor={$systemSettings.primaryColor}
              disabled={!$activeSurveyId}
              onclick={() => $activeSurveyId && view.set('analytics')}
            >
              <BarChart3 slot="icon" class="w-4 h-4" />
            </NavItem>
            <NavItem
              active={$view === 'settings'}
              label={$t_store.settings}
              activeColor={$systemSettings.primaryColor}
              onclick={() => view.set('settings')}
            >
              <Settings slot="icon" class="w-4 h-4" />
            </NavItem>
          </nav>

          <div class="p-6 border-t border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 rounded-full bg-slate-700 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                <User class="w-4 h-4" />
              </div>
              <div class="flex-grow min-w-0">
                <p class="text-xs font-bold text-white truncate">{$user?.name}</p>
                <p class="text-[10px] text-slate-500 dark:text-slate-600 truncate">{$user?.email}</p>
              </div>
            </div>
            <button 
              onclick={handleLogout}
              class="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all group"
            >
              <LogOut class="w-4 h-4 transition-transform group-hover:scale-110" />
              <span class="text-xs font-bold">{$t_store.logout}</span>
            </button>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-grow flex flex-col overflow-hidden">
          {#if $view === 'dashboard'}
            <DashboardView 
              surveys={$surveys} 
              onCreateNew={handleCreateNew}
              onEdit={handleEdit}
              onViewStats={handleViewStats}
              onDelete={handleDelete}
              onFill={handleFill}
              primaryColor={$systemSettings.primaryColor}
              language={$systemSettings.language}
              userPub={$user?.pub}
            />
          {:else if $view === 'editor' && $activeSurvey}
            <EditorView 
              survey={$activeSurvey}
              onBack={() => view.set('dashboard')}
              onUpdateSurvey={updateActiveSurvey}
              selectedSecId={$selectedSecId}
              setSelectedSecId={selectedSecId.set}
              selectedFldId={$selectedFldId}
              setSelectedFldId={selectedFldId.set}
              addSection={addSection}
              onDrop={onDrop}
              primaryColor={$systemSettings.primaryColor}
              language={$systemSettings.language}
            />
          {:else if $view === 'analytics' && $activeSurvey}
            <AnalyticsView 
              survey={$activeSurvey}
              onBack={() => view.set('dashboard')}
              primaryColor={$systemSettings.primaryColor}
              language={$systemSettings.language}
            />
          {:else if $view === 'settings'}
            <SettingsView 
              settings={$systemSettings}
              onUpdate={systemSettings.set}
              language={$systemSettings.language}
            />
          {:else if $view === 'fill' && $activeSurvey}
            <SurveyFillView 
              survey={$activeSurvey}
              onBack={() => view.set('dashboard')}
              onSubmit={(data: any) => {
                console.log('Survey submitted:', data);
                view.set('dashboard');
              }}
              language={$systemSettings.language}
            />
          {/if}
        </main>
  {/if}
</div>