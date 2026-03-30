<script lang="ts">
  import { Plus, BarChart3, Play, MoreVertical, Trash2, Users, Calendar } from 'lucide-svelte';
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
  }

  let { surveys, onCreateNew, onEdit, onViewStats, onDelete, onFill, primaryColor, language } = $props<Props>();

  const t = $derived.by(() => TRANSLATIONS[(language as Language) || '简体中文']);
</script>

<div class="flex-grow flex flex-col p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950">
  <div class="flex justify-between items-end mb-8">
    <div>
      <h1 class="text-2xl font-black text-slate-900 dark:text-slate-100">{t.dashboard}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.dashboardDesc}</p>
    </div>
    <button 
      onclick={onCreateNew}
      class="px-6 py-3 text-white rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center gap-2"
      style={{ 
        backgroundColor: primaryColor,
        boxShadow: `0 10px 15px -3px ${primaryColor}33`
      }}
    >
      <Plus class="w-4 h-4" /> {t.createNew}
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    onmouseenter={(e) => e.currentTarget.style.backgroundColor = `${primaryColor}11`}
                    onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="填写问卷"
                  >
                    <Play class="w-4 h-4" />
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