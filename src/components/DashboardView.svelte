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

<div class="flex-grow flex flex-col p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950">
  <div class="flex justify-between items-end mb-8">
    <div>
      <h1 class="text-2xl font-black text-slate-900 dark:text-slate-100">{t.dashboard}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.dashboardDesc}</p>
    </div>
    <button 
      onclick={onCreateNew}
      class="px-6 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center gap-2"
      style={{ 
        backgroundColor: primaryColor,
        color: buttonTextColor,
        boxShadow: `0 10px 15px -3px ${primaryColor}33`
      }}
    >
      <Plus class="w-4 h-4" style={{ color: buttonTextColor }} /> {t.createNew}
    </button>
  </div>

  <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
    {#each surveys as survey}
      <div key={survey.id} class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all group">
        <div class="flex justify-between items-start mb-4">
          <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" classList={{
            "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400": survey.status === 'published',
            "bg-slate-100 text-slate-50 dark:bg-slate-800 dark:text-slate-400": survey.status === 'draft',
            "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400": survey.status !== 'published' && survey.status !== 'draft'
          }}>
            {survey.status === 'published' ? t.published : survey.status === 'draft' ? t.draft : t.closed}
          </span>
          <div class="flex gap-2">
            {#if survey.status === 'published'}
              <button 
                    onclick={() => onFill(survey.id)}
                    class="p-1.5 rounded-lg transition-colors"
                    style={{ color: primaryColor }}
                    onmouseenter={(e) => {
                      e.currentTarget.style.backgroundColor = `${primaryColor}11`;
                      e.currentTarget.style.color = primaryColor;
                    }}
                    onmouseleave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = primaryColor;
                    }}
                    title="填写问卷"
                  >
                    <Play class="w-4 h-4" style={{ color: primaryColor }} />
                  </button>
            {/if}
            <button class="text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
              <MoreVertical class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <h3 
          class="text-lg font-bold mb-2 transition-colors text-slate-900 dark:text-slate-100"
          style={{ color: 'inherit' }}
          onmouseenter={(e) => e.currentTarget.style.color = primaryColor}
          onmouseleave={(e) => e.currentTarget.style.color = 'inherit'}
        >
          {survey.title}
        </h3>
        <div class="flex items-center gap-2 mb-2">
          <span class="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase">{t.version} V{survey.version || 1}</span>
          {#if survey.publishedSchema}
            <span class="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
            <span class="text-[10px] font-bold uppercase" style={{ color: primaryColor }}>
              {t.onlineLocked}
            </span>
          {/if}
        </div>
        <p class="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mb-6 h-8">{survey.description}</p>
        
        <div class="flex items-center gap-4 mb-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <div class="flex items-center gap-1.5">
            <Users class="w-3 h-3" /> {survey.responsesCount} {t.responses}
          </div>
          <div class="flex items-center gap-1.5">
            <Calendar class="w-3 h-3" /> {survey.createdAt}
          </div>
        </div>

        <div class="flex gap-2">
          <button 
            onclick={() => onEdit(survey.id)}
            class="flex-grow py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
            onmouseenter={(e) => {
              e.currentTarget.style.backgroundColor = `${primaryColor}11`;
              e.currentTarget.style.color = primaryColor;
            }}
            onmouseleave={(e) => {
              e.currentTarget.style.backgroundColor = '';
              e.currentTarget.style.color = '';
            }}
          >
            {t.editSurvey}
          </button>
          <button 
            onclick={() => onViewStats(survey.id)}
            class="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
            onmouseenter={(e) => {
              e.currentTarget.style.backgroundColor = `${primaryColor}11`;
              e.currentTarget.style.color = primaryColor;
            }}
            onmouseleave={(e) => {
              e.currentTarget.style.backgroundColor = '';
              e.currentTarget.style.color = '';
            }}
          >
            <BarChart3 class="w-4 h-4" />
          </button>
          <button 
            onclick={() => copyShareLink(survey.id)}
            class="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-500 dark:hover:text-green-400"
          >
            {#if copiedSurveyId === survey.id}
              <Check class="w-4 h-4 text-green-500" />
            {:else}
              <Share2 class="w-4 h-4" />
            {/if}
          </button>
          <button 
            onclick={() => onDelete(survey.id)}
            class="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 transition-all"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>