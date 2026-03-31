<script lang="ts">
  import { ChevronRight, Lock, Layers, User, ArrowLeft } from 'lucide-svelte';
  import { TRANSLATIONS } from '../i18n';
  import type { Language } from '../i18n';
  import Gun from 'gun';
  import 'gun/sea';

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

  const t = $derived.by(() => TRANSLATIONS[(language as Language) || '简体中文']);
  const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
  const userInstance = gun.user();

  const handleLogin = (e: Event) => {
    e.preventDefault();
    error = '';
    isLoading = true;

    userInstance.auth(username, password, (ack: any) => {
      isLoading = false;
      if (ack.err) {
        error = t.loginFailed + ': ' + ack.err;
      } else {
        onLogin({ name: username, pub: ack.pub });
      }
    });
  };

  const handleRegister = (e: Event) => {
    e.preventDefault();
    error = '';
    isLoading = true;

    userInstance.create(username, password, (ack: any) => {
      isLoading = false;
      if (ack.err) {
        error = t.registerFailed + ': ' + ack.err;
      } else {
        // 注册成功后自动登录
        userInstance.auth(username, password, (authAck: any) => {
          if (authAck.err) {
            error = t.loginFailed + ': ' + authAck.err;
          } else {
            onLogin({ name: username, pub: authAck.pub });
          }
        });
      }
    });
  };

  const toggleMode = () => {
    isRegisterMode = !isRegisterMode;
    error = '';
  };
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-300">
  <div 
    class="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-100 dark:border-slate-800 overflow-hidden"
  >
    <div class="p-10">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6" style={{ backgroundColor: primaryColor }}>
          <Layers class="text-white w-7 h-7" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">InsightFlow</h1>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enterprise Edition</p>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-xl font-black text-slate-800 dark:text-slate-200">
          {isRegisterMode ? t.register : t.login}
        </h2>
        <p class="text-sm text-slate-400 mt-1">
          {isRegisterMode ? t.registerDesc : t.loginDesc}
        </p>
      </div>

      <form onsubmit={isRegisterMode ? handleRegister : handleLogin} class="space-y-5">
        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-500 ml-1">{t.username}</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <User class="w-4 h-4" />
            </div>
            <input 
              type="text" 
              bind:value={username}
              placeholder={isRegisterMode ? t.usernamePlaceholder : t.usernamePlaceholder}
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-500 ml-1">{t.password}</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Lock class="w-4 h-4" />
            </div>
            <input 
              type="password" 
              bind:value={password}
              placeholder={isRegisterMode ? t.passwordPlaceholder : t.passwordPlaceholder}
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
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
          class="w-full py-4 rounded-2xl text-white font-black text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
          style={{ backgroundColor: primaryColor }}
        >
          {#if isLoading}
            <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {:else}
            <span>{isRegisterMode ? t.register : t.login}</span>
            <ChevronRight class="w-4 h-4" />
          {/if}
        </button>
      </form>

      <div class="mt-6 text-center">
        <button 
          onclick={toggleMode}
          class="flex items-center justify-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          {#if isRegisterMode}
              <ArrowLeft class="w-3 h-3" />
              <span>{t.backToLogin}</span>
          {:else}
              <span>{t.noAccount}</span>
              <ChevronRight class="w-3 h-3" />
          {/if}
        </button>
      </div>
    </div>
    
    <div class="bg-slate-50 dark:bg-slate-800/50 p-6 text-center border-t border-slate-100 dark:border-slate-800">
      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        © 2024 InsightFlow Enterprise • Secure Access
      </p>
    </div>
  </div>
</div>