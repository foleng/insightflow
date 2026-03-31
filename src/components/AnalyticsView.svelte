<script lang="ts">
  import { ArrowLeft } from 'lucide-svelte';
  import { TRANSLATIONS } from '../i18n';
  import type { Language } from '../i18n';
  import type { Survey } from '../types';

  interface Props {
    survey: Survey;
    onBack: () => void;
    primaryColor: string;
    language: string;
  }

  let { survey, onBack, primaryColor, language } = $props<Props>();

  const t = $derived.by(() => TRANSLATIONS[(language as Language) || '简体中文']);
  const COLORS = $derived.by(() => [primaryColor, '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']);
  
  // Generate dynamic stats based on survey fields
  const allFields = $derived.by(() => survey.schema.sections.flatMap((s: any) => s.fields));

  // 从 localStorage 加载回复数据
  const loadResponses = (): Array<{ data: Record<string, any>; submittedAt: string }> => {
    try {
      const responsesKey = `insightflow_responses_${survey.id}`;
      const data = localStorage.getItem(responsesKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  // 统计数据生成
  const statsData = $derived.by(() => {
    const responses = loadResponses();
    
    // Pick first 2 fields for charts
    const chartFields = allFields.filter((f: any) => f.type === 'select' || f.type === 'radio').slice(0, 2);
    
    const generateData = (field: any) => {
      // 统计该字段的所有选项
      const optionCounts: Record<string, number> = {};
      
      responses.forEach(response => {
        const value = response.data[field.id];
        if (value) {
          optionCounts[value] = (optionCounts[value] || 0) + 1;
        }
      });
      
      // 如果没有数据，显示默认选项
      if (Object.keys(optionCounts).length === 0) {
        return [{ name: '暂无数据', value: 0 }];
      }
      
      return Object.entries(optionCounts).map(([name, value]) => ({
        name,
        value
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
  });
  
  // 文本输入统计
  const textResponses = $derived.by(() => {
    const responses = loadResponses();
    const textFields = allFields.filter((f: any) => f.type === 'text');
    
    return textFields.map((field: any) => ({
      label: field.label,
      responses: responses.map(r => r.data[field.id]).filter(Boolean)
    }));
  });
</script>

<div class="flex-grow flex flex-col p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950">
  <div class="flex items-center gap-4 mb-8">
    <button onclick={onBack} class="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
      <ArrowLeft class="w-4 h-4 text-slate-600 dark:text-slate-400" />
    </button>
    <div>
      <h1 class="text-2xl font-black text-slate-900 dark:text-slate-100">{survey.title} - {t.analytics}</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.responsesCount.replace('{count}', survey.responsesCount)}</p>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
    <!-- 柱状图 -->
    <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <h2 class="text-lg font-bold mb-6">{statsData.bar.title}</h2>
      {#if statsData.bar.data[0]?.value > 0}
        <div class="space-y-4">
          {#each statsData.bar.data as item, i}
            <div class="flex items-center gap-4">
              <span class="w-24 text-sm text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
              <div class="flex-grow bg-slate-100 dark:bg-slate-800 rounded-full h-6 overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-500"
                  style="width: {(item.value / Math.max(...statsData.bar.data.map(d => d.value))) * 100}%; background-color: {COLORS[i % COLORS.length]}"
                ></div>
              </div>
              <span class="w-12 text-sm font-bold text-right">{item.value}</span>
            </div>
          {/each}
        </div>
      {:else}
        <div class="h-80 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
          <p class="text-slate-400">暂无数据</p>
        </div>
      {/if}
    </div>
    
    <!-- 饼图数据 -->
    <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <h2 class="text-lg font-bold mb-6">{statsData.pie.title}</h2>
      {#if statsData.pie.data[0]?.value > 0}
        <div class="space-y-4">
          {#each statsData.pie.data as item, i}
            <div class="flex items-center gap-4">
              <div 
                class="w-4 h-4 rounded-full"
                style="background-color: {COLORS[i % COLORS.length]}"
              ></div>
              <span class="flex-grow text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
              <span class="text-sm font-bold">{item.value} ({Math.round((item.value / survey.responsesCount) * 100)}%)</span>
            </div>
          {/each}
        </div>
      {:else}
        <div class="h-80 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
          <p class="text-slate-400">暂无数据</p>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- 文本回复列表 -->
  {#if textResponses.length > 0 && textResponses.some(t => t.responses.length > 0)}
    <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
      <h2 class="text-lg font-bold mb-6">文本回复</h2>
      <div class="space-y-6">
        {#each textResponses as textField}
          {#if textField.responses.length > 0}
            <div class="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0">
              <h3 class="font-bold mb-3 text-slate-700 dark:text-slate-300">{textField.label}</h3>
              <div class="space-y-2 max-h-60 overflow-y-auto">
                {#each textField.responses.slice(0, 10) as response}
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                    {response}
                  </div>
                {/each}
                {#if textField.responses.length > 10}
                  <p class="text-sm text-slate-400 text-center">还有 {textField.responses.length - 10} 条回复...</p>
                {/if}
              </div>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>