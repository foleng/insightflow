<script lang="ts">
  import { ChevronRight, Lock, Layers, User, ArrowLeft } from 'lucide-svelte';
  import { TRANSLATIONS } from '../i18n';
  import type { Language } from '../i18n';

  interface Props {
    onLogin: (user: { name: string; pub: string }) => void;
    language: string;
    primaryColor: string;
  }

  let { onLogin, language, primaryColor } = $props<Props>();

  let username = $state('');
  let password = $state('');
  let error = $state('');
  let isLoading = $state(false);
  let isRegisterMode = $state(false);
  let isHidingEyes = $state(false);

  const t = $derived.by(() => TRANSLATIONS[(language as Language) || '简体中文']);

  // 简单的本地用户存储（使用 localStorage）
  const USER_STORAGE_KEY = 'insightflow_users';
  const CURRENT_USER_KEY = 'insightflow_current_user';

  // 获取存储的用户列表
  const getStoredUsers = (): Record<string, { password: string; pub: string }> => {
    try {
      const data = localStorage.getItem(USER_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  // 保存用户列表
  const saveUsers = (users: Record<string, { password: string; pub: string }>) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
  };

  // 生成简单的 pub key
  const generatePub = (username: string): string => {
    return 'pub_' + btoa(username).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  };

  const handleLogin = (e: Event) => {
    e.preventDefault();
    error = '';
    isLoading = true;

    console.log('Login attempt:', { username });

    // 模拟网络延迟
    setTimeout(() => {
      const users = getStoredUsers();
      const user = users[username];

      if (!user) {
        isLoading = false;
        error = t.loginFailed + ': 用户不存在';
        return;
      }

      if (user.password !== password) {
        isLoading = false;
        error = t.loginFailed + ': 密码错误';
        return;
      }

      // 登录成功
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ name: username, pub: user.pub }));
      isLoading = false;
      onLogin({ name: username, pub: user.pub });
    }, 500); // 500ms 延迟模拟网络请求
  };

  const handleRegister = (e: Event) => {
    e.preventDefault();
    error = '';
    isLoading = true;

    // 模拟网络延迟
    setTimeout(() => {
      const users = getStoredUsers();

      if (users[username]) {
        isLoading = false;
        error = t.registerFailed + ': 用户名已存在';
        return;
      }

      // 创建新用户
      const pub = generatePub(username);
      users[username] = { password, pub };
      saveUsers(users);

      // 自动登录
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ name: username, pub }));
      isLoading = false;
      onLogin({ name: username, pub });
    }, 500); // 500ms 延迟模拟网络请求
  };

  const toggleMode = () => {
    isRegisterMode = !isRegisterMode;
    error = '';
  };

  // 眼睛追踪和遮眼功能
  let pupilLTransform = $state('translate(0, 0)');
  let pupilRTransform = $state('translate(0, 0)');

  const handleAccountFocus = () => {
    isHidingEyes = false;
    pupilLTransform = 'translate(0, 5)';
    pupilRTransform = 'translate(0, 5)';
  };

  const handlePasswordFocus = () => {
    isHidingEyes = true;
  };

  const handleAccountInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const val = target.value.length;
    // 根据输入长度模拟眼神左右移动 (限制在 -8 到 8 之间)
    const moveX = Math.min(Math.max(val - 10, -8), 8);
    const moveY = 2; // 稍微向下看
    
    pupilLTransform = `translate(${moveX}, ${moveY})`;
    pupilRTransform = `translate(${moveX}, ${moveY})`;
  };

  const handleBlur = (e: Event) => {
    if (e.target !== document.getElementById('password-input')) {
      isHidingEyes = false;
      pupilLTransform = 'translate(0, 0)';
      pupilRTransform = 'translate(0, 0)';
    }
  };
</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');
  
  body {
    font-family: 'Inter', sans-serif;
  }

  /* 左右布局容器 */
  .split-container {
    display: flex;
    min-height: 100vh;
    width: 100%;
  }

  /* 左侧动画区 */
  .left-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at center, #1e1b4b 0%, #0a0c10 100%);
    position: relative;
  }

  /* 右侧表单区 */
  .right-panel {
    width: 450px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0f1218;
    border-left: 1px solid rgba(255, 255, 255, 0.05);
    z-index: 10;
  }

  /* --- 猫头鹰 SVG 动画样式 --- */
  #owl {
    width: 300px;
    height: auto;
    transition: all 0.5s ease;
  }

  /* 眼睛追踪基础 */
  .eye-pupil {
    transition: transform 0.1s ease-out;
  }

  /* 翅膀遮眼动作 */
  .wing {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform-origin: bottom;
  }

  /* 状态控制类 */
  .is-hiding-eyes .wing-left {
    transform: translateY(-70px) rotate(30deg);
  }
  .is-hiding-eyes .wing-right {
    transform: translateY(-70px) rotate(-30deg);
  }
  .is-hiding-eyes .eye {
    opacity: 0;
  }

  /* 表单样式微调 */
  .glass-card {
    width: 80%;
    padding: 2rem;
  }
  .input-group {
    position: relative;
    margin-bottom: 1.5rem;
  }
</style>

<div class="split-container">
  <!-- 左侧：动态猫头鹰 -->
  <div class="left-panel">
    <svg id="owl" class={isHidingEyes ? 'is-hiding-eyes' : ''} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <!-- 身体 -->
      <path d="M40,120 Q100,180 160,120 Q160,40 100,40 Q40,40 40,120" fill="#2d3748"/>
      
      <!-- 眼睛 -->
      <g class="eye-group">
        <!-- 左眼 -->
        <circle cx="75" cy="90" r="22" fill="white" class="eye"/>
        <circle cx="75" cy="90" r="10" fill="#1a202c" class="eye-pupil" transform={pupilLTransform}/>
        <!-- 右眼 -->
        <circle cx="125" cy="90" r="22" fill="white" class="eye"/>
        <circle cx="125" cy="90" r="10" fill="#1a202c" class="eye-pupil" transform={pupilRTransform}/>
      </g>

      <!-- 喙 -->
      <path d="M95,110 L105,110 L100,120 Z" fill="#ed8936"/>

      <!-- 翅膀 (遮眼动画核心) -->
      <path class="wing wing-left" d="M10,130 Q30,120 45,140 L40,160 Q20,170 10,130" fill="#4a5568"/>
      <path class="wing wing-right" d="M190,130 Q170,120 155,140 L160,160 Q180,170 190,130" fill="#4a5568"/>
    </svg>
  </div>

  <!-- 右侧：登录表单 -->
  <div class="right-panel">
    <div class="glass-card">
      <div class="mb-10 text-left">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6" style={{ backgroundColor: primaryColor }}>
            <Layers class="text-white w-7 h-7" />
          </div>
          <div>
            <h1 class="text-2xl font-black text-white">InsightFlow</h1>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enterprise Edition</p>
          </div>
        </div>

        <h2 class="text-3xl font-bold text-white">
          {isRegisterMode ? t.register : t.login}
        </h2>
        <p class="text-sm text-slate-500 mt-2">
          {isRegisterMode ? t.registerDesc : t.loginDesc}
        </p>
      </div>

      <form onsubmit={isRegisterMode ? handleRegister : handleLogin} class="space-y-5">
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-500 uppercase mb-2">{t.username}</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <User class="w-4 h-4" />
            </div>
            <input 
              type="text" 
              id="account-input"
              bind:value={username}
              placeholder={isRegisterMode ? t.usernamePlaceholder : t.usernamePlaceholder}
              onfocus={handleAccountFocus}
              oninput={handleAccountInput}
              onblur={handleBlur}
              class="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 text-white"
              required
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-500 uppercase mb-2">{t.password}</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Lock class="w-4 h-4" />
            </div>
            <input 
              type="password" 
              id="password-input"
              bind:value={password}
              placeholder="••••••••"
              onfocus={() => isHidingEyes = true}
              onblur={() => isHidingEyes = false}
              class="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 text-white"
              required
            />
          </div>
        </div>

        {#if error}
          <p 
            class="text-xs font-bold text-red-500 ml-1"
          >
            {error}
          </p>
        {/if}

        <button 
          type="submit"
          disabled={isLoading}
          class="w-full py-4 btn-gradient font-bold transition-all mt-4 flex items-center justify-center gap-2"
        >
          {#if isLoading}
            <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {:else}
            <span class="text-white">{isRegisterMode ? t.register : t.login}</span>
            <ChevronRight class="w-4 h-4 text-white" />
          {/if}
        </button>
      </form>

      <div class="mt-6 text-center">
        <button 
          onclick={toggleMode}
          class="flex items-center justify-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          {#if isRegisterMode}
              <ArrowLeft class="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>{t.backToLogin}</span>
          {:else}
              <span>{t.noAccount}</span>
              <ChevronRight class="w-3 h-3 text-blue-600 dark:text-blue-400" />
          {/if}
        </button>
      </div>

      <div class="mt-8 text-center">
        <p class="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          © 2024 InsightFlow Enterprise • Secure Access
        </p>
      </div>
    </div>
  </div>
</div>