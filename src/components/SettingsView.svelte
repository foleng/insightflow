<script lang="ts">
  import { TRANSLATIONS } from '../i18n';
  import type { Language } from '../i18n';
  import type { SystemSettings } from '../types';

  interface Props {
    settings: SystemSettings;
    onUpdate: (settings: SystemSettings) => void;
    language: string;
  }

  let { settings, onUpdate, language } = $props<Props>();

  const t = $derived.by(() => TRANSLATIONS[(language as Language) || '简体中文']);

  // Create a local copy of settings to edit
  let localSettings = $state({ ...settings });

  const handleUpdate = () => {
    onUpdate(localSettings);
  };
</script>

<div 
  class="flex-grow p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950"
>
  <h1 class="text-2xl font-black text-slate-900 dark:text-slate-100 mb-8">{t.settings}</h1>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
      <h2 class="text-lg font-bold mb-4">{t.basicSettings}</h2>
      <div class="space-y-4">
        <div>
          <label for="system-name" class="text-sm font-bold text-slate-500 mb-2 block">{t.systemName}</label>
          <input 
            id="system-name"
            type="text" 
            value={localSettings.systemName}
            onchange={(e) => { localSettings.systemName = e.target.value; handleUpdate(); }}
            class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none"
          />
        </div>
        <div>
          <label for="system-language" class="text-sm font-bold text-slate-500 mb-2 block">{t.language}</label>
          <select 
            id="system-language"
            value={localSettings.language}
            onchange={(e) => { localSettings.language = e.target.value; handleUpdate(); }}
            class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none"
          >
            <option value="简体中文">简体中文</option>
            <option value="繁體中文">繁體中文</option>
            <option value="English">English</option>
          </select>
        </div>
        <div>
          <label for="system-timezone" class="text-sm font-bold text-slate-500 mb-2 block">{t.timezone}</label>
          <input 
            id="system-timezone"
            type="text" 
            value={localSettings.timezone}
            onchange={(e) => { localSettings.timezone = e.target.value; handleUpdate(); }}
            class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none"
          />
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
      <h2 class="text-lg font-bold mb-4">{t.appearance}</h2>
      <div class="space-y-4">
        <div>
          <label for="primary-color" class="text-sm font-bold text-slate-500 mb-2 block">{t.primaryColor}</label>
          <div class="flex gap-3 items-center">
            <input 
              id="primary-color"
              type="color" 
              value={localSettings.primaryColor}
              onchange={(e) => { localSettings.primaryColor = e.target.value; handleUpdate(); }}
              class="w-12 h-12 rounded-xl cursor-pointer border-none p-0 bg-transparent"
            />
            <input 
              type="text" 
              value={localSettings.primaryColor}
              onchange={(e) => { localSettings.primaryColor = e.target.value; handleUpdate(); }}
              class="flex-grow p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none"
            />
          </div>
        </div>
        <div>
          <label for="dark-mode" class="text-sm font-bold text-slate-500 mb-2 block">{t.darkMode}</label>
          <select 
            id="dark-mode"
            value={localSettings.darkMode}
            onchange={(e) => { localSettings.darkMode = e.target.value; handleUpdate(); }}
            class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none"
          >
            <option value="跟随系统">{t.followSystem}</option>
            <option value="开启">{t.on}</option>
            <option value="关闭">{t.off}</option>
          </select>
        </div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <label for="compact-mode" class="text-sm font-bold text-slate-500">{t.compactMode}</label>
            <input 
              id="compact-mode"
              type="checkbox" 
              checked={localSettings.compactMode}
              onchange={(e) => { localSettings.compactMode = e.target.checked; handleUpdate(); }}
              class="w-5 h-5"
              style:accent-color={localSettings.primaryColor}
            />
          </div>
          <p class="text-xs text-slate-400">{t.compactModeDesc}</p>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 md:col-span-2">
      <h2 class="text-lg font-bold mb-4">{t.securitySettings}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div class="flex items-center justify-between mb-2">
            <label for="two-factor-auth" class="text-sm font-bold text-slate-500">{t.twoFactorAuth}</label>
            <input 
              id="two-factor-auth"
              type="checkbox" 
              checked={localSettings.twoFactorAuth}
              onchange={(e) => { localSettings.twoFactorAuth = e.target.checked; handleUpdate(); }}
              class="w-5 h-5"
              style:accent-color={localSettings.primaryColor}
            />
          </div>
          <p class="text-xs text-slate-400">{t.twoFactorAuthDesc}</p>
        </div>
        <div>
          <label for="password-expiry" class="text-sm font-bold text-slate-500 mb-2 block">{t.passwordExpiry}</label>
          <select 
            id="password-expiry"
            value={localSettings.passwordExpiry}
            onchange={(e) => { localSettings.passwordExpiry = e.target.value; handleUpdate(); }}
            class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none"
          >
            <option value="30 天">30 天</option>
            <option value="60 天">60 天</option>
            <option value="90 天">90 天</option>
            <option value="180 天">180 天</option>
            <option value="永不过期">{t.neverExpire}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 md:col-span-2">
      <h2 class="text-lg font-bold mb-4">{t.notificationSettings}</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div class="flex items-center justify-between mb-2">
            <label for="email-notifications" class="text-sm font-bold text-slate-500">{t.emailNotifications}</label>
            <input 
              id="email-notifications"
              type="checkbox" 
              checked={localSettings.emailNotifications}
              onchange={(e) => { localSettings.emailNotifications = e.target.checked; handleUpdate(); }}
              class="w-5 h-5"
              style:accent-color={localSettings.primaryColor}
            />
          </div>
          <p class="text-xs text-slate-400">{t.emailNotificationsDesc}</p>
        </div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <label for="in-app-popups" class="text-sm font-bold text-slate-500">{t.inAppPopups}</label>
            <input 
              id="in-app-popups"
              type="checkbox" 
              checked={localSettings.inAppPopups}
              onchange={(e) => { localSettings.inAppPopups = e.target.checked; handleUpdate(); }}
              class="w-5 h-5"
              style:accent-color={localSettings.primaryColor}
            />
          </div>
          <p class="text-xs text-slate-400">{t.inAppPopupsDesc}</p>
        </div>
        <div>
          <label for="feedback-reminder" class="text-sm font-bold text-slate-500 mb-2 block">{t.feedbackReminder}</label>
          <select 
            id="feedback-reminder"
            value={localSettings.feedbackReminder}
            onchange={(e) => { localSettings.feedbackReminder = e.target.value; handleUpdate(); }}
            class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none"
          >
            <option value="即时">{t.immediate}</option>
            <option value="每天">{t.daily}</option>
            <option value="每周">{t.weekly}</option>
            <option value="每月">{t.monthly}</option>
            <option value="关闭">{t.off}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 md:col-span-2">
      <h2 class="text-lg font-bold mb-4">大模型配置</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div class="flex items-center justify-between mb-2">
            <label for="ai-enabled" class="text-sm font-bold text-slate-500">启用 AI 功能</label>
            <input 
              id="ai-enabled"
              type="checkbox" 
              checked={localSettings.aiEnabled}
              onchange={(e) => { localSettings.aiEnabled = e.target.checked; handleUpdate(); }}
              class="w-5 h-5"
              style:accent-color={localSettings.primaryColor}
            />
          </div>
          <p class="text-xs text-slate-400">启用后可以通过 AI 对话生成问卷</p>
        </div>
        <div>
          <label for="ai-provider" class="text-sm font-bold text-slate-500 mb-2 block">AI 提供商</label>
          <select 
            id="ai-provider"
            value={localSettings.aiProvider}
            onchange={(e) => { localSettings.aiProvider = e.target.value as any; handleUpdate(); }}
            class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none"
          >
            <option value="gemini">Google Gemini</option>
            <option value="minimax">Minimax</option>
            <option value="baidu">百度文心一言</option>
            <option value="tencent">腾讯混元</option>
          </select>
        </div>
        
        <!-- Gemini 配置 -->
        {#if localSettings.aiProvider === 'gemini'}
        <div class="md:col-span-2">
          <label for="gemini-api-key" class="text-sm font-bold text-slate-500 mb-2 block">Gemini API Key</label>
          <input 
            id="gemini-api-key"
            type="password" 
            value={localSettings.geminiApiKey}
            onchange={(e) => { localSettings.geminiApiKey = e.target.value; handleUpdate(); }}
            class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none"
            placeholder="Enter your Gemini API key"
          />
          <p class="text-xs text-slate-400 mt-1">You can get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" class="text-blue-500">Google AI Studio</a></p>
        </div>
        <div>
          <label for="ai-model" class="text-sm font-bold text-slate-500 mb-2 block">AI 模型</label>
          <select 
            id="ai-model"
            value={localSettings.aiModel}
            onchange={(e) => { localSettings.aiModel = e.target.value; handleUpdate(); }}
            class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none"
          >
            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
          </select>
        </div>
        {/if}
        
        <!-- Minimax 配置 -->
        {#if localSettings.aiProvider === 'minimax'}
        <div class="md:col-span-2">
          <label for="minimax-api-key" class="text-sm font-bold text-slate-500 mb-2 block">Minimax API Key</label>
          <input 
            id="minimax-api-key"
            type="password" 
            value={localSettings.minimaxApiKey}
            onchange={(e) => { localSettings.minimaxApiKey = e.target.value; handleUpdate(); }}
            class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none"
            placeholder="Enter your Minimax API key"
          />
        </div>
        <div class="md:col-span-2">
          <label for="minimax-group-id" class="text-sm font-bold text-slate-500 mb-2 block">Minimax Group ID</label>
          <input 
            id="minimax-group-id"
            type="text" 
            value={localSettings.minimaxGroupId}
            onchange={(e) => { localSettings.minimaxGroupId = e.target.value; handleUpdate(); }}
            class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none"
            placeholder="Enter your Minimax Group ID"
          />
          <p class="text-xs text-slate-400 mt-1">You can get these from <a href="https://platform.minimax.chat/console/api-keys" target="_blank" class="text-blue-500">Minimax Console</a></p>
        </div>
        <div>
          <label for="ai-model" class="text-sm font-bold text-slate-500 mb-2 block">AI 模型</label>
          <select 
            id="ai-model"
            value={localSettings.aiModel}
            onchange={(e) => { localSettings.aiModel = e.target.value; handleUpdate(); }}
            class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none"
          >
            <option value="MiniMax-M2.7">MiniMax-M2.7</option>
            <option value="abab5.5-chat">abab5.5-chat</option>
            <option value="abab5.5s-chat">abab5.5s-chat</option>
            <option value="abab6.0-chat">abab6.0-chat</option>
          </select>
        </div>
        {/if}
        
        <!-- 通用配置 -->
        <div>
          <label for="ai-temperature" class="text-sm font-bold text-slate-500 mb-2 block">AI 温度 (0-1)</label>
          <input 
            id="ai-temperature"
            type="number" 
            step="0.1"
            min="0"
            max="1"
            value={localSettings.aiTemperature}
            onchange={(e) => { localSettings.aiTemperature = parseFloat(e.target.value); handleUpdate(); }}
            class="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none"
          />
          <p class="text-xs text-slate-400">Higher values make output more creative, lower values more deterministic</p>
        </div>
      </div>
    </div>
  </div>
</div>