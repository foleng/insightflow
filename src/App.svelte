<script lang="ts">
  import './app.css';
  import { writable, derived, get } from 'svelte/store';
  import { onMount } from 'svelte';
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
  import 'gun/lib/rindexed'; // Enable IndexedDB support
  
  // Import router
  import { initRouter, navigateTo } from './router';

  // Initialize Gun.js with IndexedDB persistence
  const gun = Gun({
    // 使用本地 relay peer，SEA 需要网络功能
    peers: ['https://relay.gun.eco/gun'],
    localStorage: false, // Disable localStorage
    radisk: true, // Enable RAD (IndexedDB) storage
    file: 'insightflow-data' // IndexedDB database name
  });
  const userInstance = gun.user();

  // Store setup
  const isAuthenticated = writable(false);
  const user = writable<{ name: string; email: string; pub: string } | null>(null);
  const view = writable<ViewType>('dashboard');
  
  // 从 localStorage 加载问卷数据
  const loadSurveysFromStorage = (): Survey[] => {
    try {
      const data = localStorage.getItem('insightflow_surveys');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };
  
  const surveys = writable<Survey[]>(loadSurveysFromStorage());
  
  // 订阅 surveys 变化并保存到 localStorage
  surveys.subscribe(value => {
    localStorage.setItem('insightflow_surveys', JSON.stringify(value));
  });
  
  const activeSurveyId = writable<string | null>(null);
  
  // 从 localStorage 加载系统设置
  const loadSettingsFromStorage = (): SystemSettings => {
    try {
      const data = localStorage.getItem('insightflow_settings');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };
  
  const storedSettings = loadSettingsFromStorage();
  const systemSettings = writable<SystemSettings>(storedSettings || {
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
  
  // 订阅 settings 变化并保存到 localStorage
  systemSettings.subscribe(value => {
    localStorage.setItem('insightflow_settings', JSON.stringify(value));
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

  // Create reactive variables for use in JavaScript code
  let authState = $state(get(isAuthenticated));
  let userState = $state(get(user));
  let viewState = $state(get(view));
  let surveysState = $state(get(surveys));
  let activeSurveyIdState = $state(get(activeSurveyId));
  let activeSurveyState = $state(get(activeSurvey));
  let systemSettingsState = $state(get(systemSettings));

  // Sync store values to reactive variables
  $effect(() => {
    const authUnsub = isAuthenticated.subscribe(val => authState = val);
    const userUnsub = user.subscribe(val => userState = val);
    const viewUnsub = view.subscribe(val => viewState = val);
    const surveysUnsub = surveys.subscribe(val => surveysState = val);
    const activeSurveyIdUnsub = activeSurveyId.subscribe(val => activeSurveyIdState = val);
    const activeSurveyUnsub = activeSurvey.subscribe(val => activeSurveyState = val);
    const systemSettingsUnsub = systemSettings.subscribe(val => systemSettingsState = val);

    return () => {
      authUnsub();
      userUnsub();
      viewUnsub();
      surveysUnsub();
      activeSurveyIdUnsub();
      activeSurveyUnsub();
      systemSettingsUnsub();
    };
  });

  // --- Router Setup ---
  let routerInitialized = false;
  let authChecked = $state(false);
  
  // Initialize router once when component mounts and auth is checked
  onMount(() => {
    // Wait for auth check before initializing router
    const checkAuthAndInit = () => {
      if (authChecked && !routerInitialized) {
        initRouter(
          (newView) => view.set(newView),
          (id) => activeSurveyId.set(id),
          () => authState,
          () => navigateTo('/login')
        );
        routerInitialized = true;
      }
    };

    // Check immediately if auth is already checked
    checkAuthAndInit();

    // Also set up a watcher for authChecked
    const interval = setInterval(() => {
      checkAuthAndInit();
      if (routerInitialized) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  });

  // Handle authentication-based navigation
  $effect(() => {
    if (!routerInitialized) return;
    
    // Redirect to login if not authenticated and not already on login page
    if (!authState && viewState !== 'login') {
      navigateTo('/login');
    }
    
    // Redirect to dashboard if authenticated and on login page
    if (authState && viewState === 'login') {
      navigateTo('/');
    }
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
    
    // Save to Gun.js if authenticated
    if (authState && userState) {
      userInstance.get('surveys').get(newId).put(newSurvey);
    }
    
    // Navigate to editor view
    navigateTo(`/editor/${newId}`);
  };

  const handleEdit = (id: string) => {
    navigateTo(`/editor/${id}`);
  };

  const handleViewStats = (id: string) => {
    navigateTo(`/analytics/${id}`);
  };

  const handleDelete = (id: string) => {
    surveys.update(prev => prev.filter(s => s.id !== id));
    activeSurveyId.update(prev => prev === id ? null : prev);
    
    // Delete from Gun.js if authenticated
    if (authState && userState) {
      userInstance.get('surveys').get(id).put(null);
    }
    
    // If we're on the deleted survey's page, navigate back to dashboard
    if (activeSurveyIdState === id) {
      navigateTo('/');
    }
  };

  const handleFill = (id: string) => {
    navigateTo(`/fill/${id}`);
  };

  // 清理超过 30 天的旧回复数据
  const cleanupOldResponses = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // 遍历所有 localStorage 键
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('insightflow_responses_')) {
        try {
          const responses = JSON.parse(localStorage.getItem(key) || '[]');
          const filteredResponses = responses.filter((r: any) => {
            const submittedDate = new Date(r.submittedAt);
            return submittedDate > thirtyDaysAgo;
          });
          
          if (filteredResponses.length < responses.length) {
            localStorage.setItem(key, JSON.stringify(filteredResponses));
            console.log(`Cleaned up ${responses.length - filteredResponses.length} old responses from ${key}`);
          }
        } catch (e) {
          console.error(`Failed to cleanup ${key}:`, e);
        }
      }
    }
  };

  // --- Editor Handlers ---
  const updateActiveSurvey = (updates: Partial<Survey>) => {
    const currentActiveId = activeSurveyIdState;
    if (!currentActiveId) return;
    surveys.update(prev => prev.map(s => s.id === currentActiveId ? { ...s, ...updates } : s));
    
    // Save to Gun.js if authenticated
    if (authState && userState) {
      const updatedSurvey = surveysState.find(s => s.id === currentActiveId);
      if (updatedSurvey) {
        userInstance.get('surveys').get(currentActiveId).put(updatedSurvey);
      }
    }
  };

  const updateSchema = (updates: Partial<Schema>) => {
    const currentActive = activeSurveyState;
    if (!currentActive) return;
    updateActiveSurvey({ schema: { ...currentActive.schema, ...updates } });
  };

  const addSection = () => {
    const currentActive = activeSurveyState;
    if (!currentActive) return;
    const newSec: Section = { id: 'sec_' + Date.now(), title: '新章节', fields: [] };
    updateSchema({ sections: [...currentActive.schema.sections, newSec] });
  };

  const onDrop = (e: DragEvent, secId: string) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type') as FieldType;
    const currentActive = activeSurveyState;
    if (!type || !currentActive) return;

    const newFld: Field = {
      id: 'fld_' + Date.now(),
      type,
      label: '新题目',
      required: false,
      logic: ''
    };

    updateSchema({
      sections: currentActive.schema.sections.map(s => 
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
    
    // Navigate to dashboard after login
    navigateTo('/');
  };

  // Logout handler
  const handleLogout = () => {
    isAuthenticated.set(false);
    user.set(null);
    localStorage.removeItem('insightflow_current_user');
    surveys.set([]);
    
    // Navigate to login page after logout
    navigateTo('/login');
  };
  
  // Check if already logged in (使用 localStorage)
  const checkLoginStatus = () => {
    try {
      const currentUser = localStorage.getItem('insightflow_current_user');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        isAuthenticated.set(true);
        user.set({ 
          name: userData.name, 
          email: userData.pub, 
          pub: userData.pub 
        });
        console.log('Restored login session:', userData);
      }
    } catch (e) {
      console.error('Failed to restore login session:', e);
    }
    // Mark auth check as complete
    authChecked = true;
  };
  
  // 立即检查登录状态
  checkLoginStatus();
</script>

<style>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>

<div class="flex h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
  {#if viewState === 'login' || !authState}
    <!-- Login View -->
    <LoginView 
      onLogin={handleLogin}
      language={systemSettingsState.language}
      primaryColor={systemSettingsState.primaryColor}
    />
  {:else}
        <!-- Sidebar Navigation -->
        <aside class="w-64 bg-slate-900 text-slate-300 dark:bg-black dark:text-slate-400 flex flex-col shrink-0">
          <div class="p-6 flex items-center gap-3 text-white font-black italic uppercase tracking-tighter">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center not-italic" style:background-color={systemSettingsState.primaryColor}>
              <Layers class="text-white w-5 h-5" />
            </div>
            <span class="truncate">{systemSettingsState.systemName}</span>
          </div>

          <nav class="flex-grow px-4 space-y-1">
            <NavItem
              active={viewState === 'dashboard'}
              label={$t_store.dashboard}
              activeColor={systemSettingsState.primaryColor}
              onclick={() => navigateTo('/')}
            >
              <LayoutDashboard slot="icon" class="w-4 h-4" />
            </NavItem>
            <NavItem
              active={viewState === 'analytics' && !!activeSurveyIdState}
              label={$t_store.analytics}
              activeColor={systemSettingsState.primaryColor}
              disabled={!activeSurveyIdState}
              onclick={() => activeSurveyIdState && navigateTo(`/analytics/${activeSurveyIdState}`)}
            >
              <BarChart3 slot="icon" class="w-4 h-4" />
            </NavItem>
            <NavItem
              active={viewState === 'settings'}
              label={$t_store.settings}
              activeColor={systemSettingsState.primaryColor}
              onclick={() => navigateTo('/settings')}
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
                <p class="text-xs font-bold text-white truncate">{userState?.name}</p>
                <p class="text-[10px] text-slate-500 dark:text-slate-600 truncate">{userState?.email}</p>
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
          {#if viewState === 'dashboard'}
            <DashboardView 
              surveys={surveysState} 
              onCreateNew={handleCreateNew}
              onEdit={handleEdit}
              onViewStats={handleViewStats}
              onDelete={handleDelete}
              onFill={handleFill}
              primaryColor={systemSettingsState.primaryColor}
              language={systemSettingsState.language}
              userPub={userState?.pub}
            />
          {:else if viewState === 'editor'}
            {#if activeSurveyState}
              <EditorView 
                survey={activeSurveyState}
                onBack={() => navigateTo('/')}
                onUpdateSurvey={updateActiveSurvey}
                selectedSecId={$selectedSecId}
                setSelectedSecId={selectedSecId.set}
                selectedFldId={$selectedFldId}
                setSelectedFldId={selectedFldId.set}
                addSection={addSection}
                onDrop={onDrop}
                primaryColor={systemSettingsState.primaryColor}
                language={systemSettingsState.language}
              />
            {:else}
              <div class="flex items-center justify-center h-full">
                <div class="text-center">
                  <p class="text-slate-500 mb-4">问卷未找到</p>
                  <button 
                    onclick={() => navigateTo('/')}
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    返回首页
                  </button>
                </div>
              </div>
            {/if}
          {:else if viewState === 'analytics' && activeSurveyState}
            <AnalyticsView 
              survey={activeSurveyState}
              onBack={() => navigateTo('/')}
              primaryColor={systemSettingsState.primaryColor}
              language={systemSettingsState.language}
            />
          {:else if viewState === 'settings'}
            <SettingsView 
              settings={systemSettingsState}
              onUpdate={(s) => systemSettings.set(s)}
              language={systemSettingsState.language}
            />
          {:else if viewState === 'fill' && activeSurveyState}
            <SurveyFillView 
              survey={activeSurveyState}
              onBack={() => authState ? navigateTo('/') : navigateTo('/login')}
              onSubmit={(data: any) => {
                console.log('Survey submitted:', JSON.parse(JSON.stringify(data)));
                
                // 增加问卷回复数
                const currentSurvey = surveysState.find(s => s.id === activeSurveyIdState);
                if (currentSurvey) {
                  const updatedSurvey = {
                    ...currentSurvey,
                    responsesCount: (currentSurvey.responsesCount || 0) + 1
                  };
                  surveys.update(prev => prev.map(s => s.id === activeSurveyIdState ? updatedSurvey : s));
                  
                  // 保存回复数据到 localStorage（带错误处理）
                  try {
                    const responsesKey = `insightflow_responses_${activeSurveyIdState}`;
                    const existingResponses = JSON.parse(localStorage.getItem(responsesKey) || '[]');
                    existingResponses.push({
                      data,
                      submittedAt: new Date().toISOString()
                    });
                    localStorage.setItem(responsesKey, JSON.stringify(existingResponses));
                  } catch (e) {
                    console.error('Failed to save response:', e);
                    // 如果 localStorage 满了，尝试清理旧数据
                    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                      console.warn('Storage quota exceeded, cleaning up old data...');
                      // 清理超过 30 天的旧数据
                      cleanupOldResponses();
                      // 重试保存
                      try {
                        const responsesKey = `insightflow_responses_${activeSurveyIdState}`;
                        const existingResponses = JSON.parse(localStorage.getItem(responsesKey) || '[]');
                        existingResponses.push({
                          data,
                          submittedAt: new Date().toISOString()
                        });
                        localStorage.setItem(responsesKey, JSON.stringify(existingResponses));
                      } catch (e2) {
                        console.error('Failed to save response after cleanup:', e2);
                      }
                    }
                  }
                }
                
                authState ? navigateTo('/') : navigateTo('/login');
              }}
              language={systemSettingsState.language}
            />
          {/if}
        </main>
  {/if}
</div>