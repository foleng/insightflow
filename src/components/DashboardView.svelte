<script lang="ts">
  import { Plus, BarChart3, Play, MoreVertical, Trash2, Users, Calendar, Share2, Copy, Check } from 'lucide-svelte';
  import { TRANSLATIONS } from '../i18n';
  import type { Language } from '../i18n';
  import type { Survey } from '../types';

  interface Props {
    surveys: Survey[];
    onCreateNew: () => void;
    onEdit: (id: string) => void;
    onViewStats: (id: string) => void;
    onDelete: (id: string) => void;
    onFill: (id: string) => void;
    primaryColor: string;
    language: string;
    userPub?: string;
  }

  let { surveys, onCreateNew, onEdit, onViewStats, onDelete, onFill, primaryColor, language, userPub } = $props<Props>();

  const t = $derived(TRANSLATIONS[(language as Language) || '简体中文']);
  let copiedSurveyId: string | null = null;

  // Function to determine text color based on background color brightness
  const getTextColor = (bgColor: string): string => {
    // Convert hex color to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate relative luminance (WCAG formula)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white for dark backgrounds, black for light backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Derived text color based on primaryColor
  const buttonTextColor = $derived(getTextColor(primaryColor));

  // Generate share link with pub and id parameters
  const generateShareLink = (surveyId: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?pub=${userPub}&id=${surveyId}`;
  };

  // Copy share link to clipboard
  const copyShareLink = async (surveyId: string) => {
    const link = generateShareLink(surveyId);
    try {
      await navigator.clipboard.writeText(link);
      copiedSurveyId = surveyId;
      setTimeout(() => {
        copiedSurveyId = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };
</script>

<div class="flex-grow flex flex-col overflow-hidden bg-white">
  <header class="p-10 pb-5">
    <div class="flex justify-between items-end">
      <div class="page-title">
        <h1 class="text-3xl font-bold text-slate-900">我的问卷</h1>
        <p class="text-slate-500 mt-1">管理您的所有调查问卷和收集到的反馈</p>
      </div>
      <button 
        onclick={onCreateNew}
        class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-7 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
      >
        <Plus class="w-5 h-5" /> 创建新问卷
      </button>
    </div>
  </header>

  <div class="flex-grow overflow-y-auto px-10 pb-10">
    <div class="grid grid-cols-2 gap-7 w-full">
      {#each surveys as survey}
        <div key={survey.id} class="bg-white border border-slate-100 rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div class="flex justify-between items-center mb-5">
            <span class={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase ${survey.status === 'published' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-100 text-slate-600'}`}>
              {survey.status === 'published' ? '已发布' : '草稿'}
            </span>
            {#if survey.status === 'published'}
              <button 
                onclick={() => onFill(survey.id)}
                class="text-green-500 w-4 h-4 cursor-pointer hover:scale-110 transition-transform"
                title="填写问卷"
              >
                <Play class="w-4 h-4" />
              </button>
            {:else}
              <MoreVertical class="text-slate-300 w-4 h-4 cursor-pointer" />
            {/if}
          </div>
          
          <h3 class="text-xl font-semibold text-slate-900 mb-3">{survey.title}</h3>
          <p class="text-sm text-slate-500 line-clamp-2 mb-6">{survey.description}</p>
          
          <div class="mt-auto pt-5 border-t border-slate-100 flex justify-between items-center">
            <div class="flex gap-4 text-sm text-slate-500">
              <span class="flex items-center gap-1.5">
                <Users class="w-4 h-4" /> {survey.responsesCount} 份
              </span>
              <span class="flex items-center gap-1.5">
                <Calendar class="w-4 h-4" /> {survey.createdAt}
              </span>
            </div>
            <div class="flex gap-2">
              {#if survey.status === 'draft'}
                <button 
                  onclick={() => onEdit(survey.id)}
                  class="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white transition-colors"
                  title="编辑"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              {:else}
                <button 
                  onclick={() => onViewStats(survey.id)}
                  class="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white transition-colors"
                  title="统计"
                >
                  <BarChart3 class="w-5 h-5" />
                </button>
              {/if}
              <button 
                onclick={() => copyShareLink(survey.id)}
                class="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white transition-colors"
                title="分享"
              >
                {#if copiedSurveyId === survey.id}
                  <Check class="w-5 h-5 text-green-500" />
                {:else}
                  <Share2 class="w-5 h-5" />
                {/if}
              </button>
              <button 
                onclick={() => onDelete(survey.id)}
                class="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                title="删除"
              >
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>