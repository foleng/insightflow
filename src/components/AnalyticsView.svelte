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

  // Mock data generation for charts
  const statsData = $derived.by(() => {
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
    <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <h2 class="text-lg font-bold mb-6">柱状图示例</h2>
      <div class="h-80 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
        <p class="text-slate-400">图表区域</p>
      </div>
    </div>
    <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <h2 class="text-lg font-bold mb-6">饼图示例</h2>
      <div class="h-80 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
        <p class="text-slate-400">图表区域</p>
      </div>
    </div>
  </div>
</div>