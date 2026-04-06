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
  
  // 从 localStorage 加载回复数据
  const loadResponses = (): Array<{ data: Record<string, any>; submittedAt: string; completionTime?: number }> => {
    try {
      const responsesKey = `insightflow_responses_${survey.id}`;
      const data = localStorage.getItem(responsesKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  // 从 localStorage 加载浏览量数据
  const loadViews = (): number => {
    try {
      const viewsKey = `insightflow_views_${survey.id}`;
      const data = localStorage.getItem(viewsKey);
      return data ? parseInt(data, 10) : 0;
    } catch {
      return 0;
    }
  };

  // 统计数据
  const responses = $derived.by(() => loadResponses());
  const responseCount = $derived.by(() => responses.length);
  const viewCount = $derived.by(() => loadViews());
  const recoveryRate = $derived.by(() => viewCount > 0 ? Math.round((responseCount / viewCount) * 100) : 0);
  const averageTime = $derived.by(() => {
    const completionTimes = responses.map(r => r.completionTime || 0).filter(t => t > 0);
    if (completionTimes.length === 0) return '0分0秒';
    const totalSeconds = completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}分${seconds}秒`;
  });

  // 回收趋势数据
  const recoveryTrend = $derived.by(() => {
    const responses = loadResponses();
    const today = new Date();
    const trendData = [];
    
    // 生成最近7天的数据
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // 统计当天的回复数
      const dayResponses = responses.filter(r => {
        const responseDate = new Date(r.submittedAt).toISOString().split('T')[0];
        return responseDate === dateStr;
      }).length;
      
      // 模拟当天的浏览量（实际应用中应该从真实数据中获取）
      const dayViews = dayResponses + Math.floor(Math.random() * 5);
      
      trendData.push({
        date: dateStr,
        views: dayViews,
        responses: dayResponses
      });
    }
    return trendData;
  });

  // 地域位置数据
  const regionData = $derived.by(() => {
    const responses = loadResponses();
    const regionCounts: Record<string, number> = {};
    
    responses.forEach(response => {
      // 模拟地域数据（实际应用中应该从真实数据中获取）
      const regions = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安'];
      const randomRegion = regions[Math.floor(Math.random() * regions.length)];
      regionCounts[randomRegion] = (regionCounts[randomRegion] || 0) + 1;
    });
    
    return Object.entries(regionCounts).map(([name, value]) => ({
      name,
      value
    }));
  });

  // 常用设备数据
  const deviceData = $derived.by(() => {
    const responses = loadResponses();
    const deviceCounts: Record<string, number> = {
      '桌面设备': 0,
      '移动设备': 0,
      '其他': 0
    };
    
    responses.forEach(response => {
      // 模拟设备数据（实际应用中应该从真实数据中获取）
      const random = Math.random();
      if (random < 0.6) {
        deviceCounts['桌面设备']++;
      } else if (random < 0.9) {
        deviceCounts['移动设备']++;
      } else {
        deviceCounts['其他']++;
      }
    });
    
    return Object.entries(deviceCounts).map(([name, value]) => ({
      name,
      value
    }));
  });

  // 常用系统数据
  const systemData = $derived.by(() => {
    const responses = loadResponses();
    const systemCounts: Record<string, number> = {
      'Android': 0,
      'Win': 0,
      'iOS': 0,
      'MacOS': 0,
      '其他': 0
    };
    
    responses.forEach(response => {
      // 模拟系统数据（实际应用中应该从真实数据中获取）
      const random = Math.random();
      if (random < 0.3) {
        systemCounts['Android']++;
      } else if (random < 0.5) {
        systemCounts['Win']++;
      } else if (random < 0.7) {
        systemCounts['iOS']++;
      } else if (random < 0.9) {
        systemCounts['MacOS']++;
      } else {
        systemCounts['其他']++;
      }
    });
    
    return Object.entries(systemCounts).map(([name, value]) => ({
      name,
      value
    }));
  });

  // 渠道来源数据
  const channelData = $derived.by(() => {
    const responses = loadResponses();
    const channelCounts: Record<string, number> = {
      '直接访问': 0,
      '社交媒体': 0,
      '邮件': 0,
      '其他': 0
    };
    
    responses.forEach(response => {
      // 模拟渠道数据（实际应用中应该从真实数据中获取）
      const random = Math.random();
      if (random < 0.4) {
        channelCounts['直接访问']++;
      } else if (random < 0.6) {
        channelCounts['社交媒体']++;
      } else if (random < 0.8) {
        channelCounts['邮件']++;
      } else {
        channelCounts['其他']++;
      }
    });
    
    return Object.entries(channelCounts).map(([name, value]) => ({
      name,
      value
    }));
  });
</script>

<div class="flex-grow flex flex-col p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950">
  <div class="flex items-center gap-4 mb-8">
    <button onclick={onBack} class="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
      <ArrowLeft class="w-4 h-4 text-slate-600 dark:text-slate-400" />
    </button>
    <div class="flex-grow">
      <h1 class="text-2xl font-black text-slate-900 dark:text-slate-100">{survey.title}</h1>
    </div>
    <div class="flex gap-8">
      <div class="text-center">
        <div class="text-sm text-slate-500 dark:text-slate-400">回收量</div>
        <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{responseCount}</div>
      </div>
      <div class="text-center">
        <div class="text-sm text-slate-500 dark:text-slate-400">浏览量</div>
        <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{viewCount}</div>
      </div>
      <div class="text-center">
        <div class="text-sm text-slate-500 dark:text-slate-400">回收率</div>
        <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{recoveryRate}%</div>
      </div>
      <div class="text-center">
        <div class="text-sm text-slate-500 dark:text-slate-400">平均完成时间</div>
        <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{averageTime}</div>
      </div>
    </div>
  </div>

  <!-- 回收趋势图表 -->
  <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">回收趋势</h2>
      <div class="flex items-center gap-4">
        <select class="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <option>日趋势</option>
          <option>周趋势</option>
          <option>月趋势</option>
        </select>
        <div class="text-sm text-slate-500 dark:text-slate-400">2026-04-06 - 2026-04-06</div>
        <button class="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
          📅
        </button>
      </div>
    </div>
    <div class="h-64 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-end justify-between p-4">
      {#each recoveryTrend as item}
        <div class="flex flex-col items-center" style="width: 40px;">
          <div class="w-12 bg-blue-500 rounded-t-md" style="height: {item.views * 10}px;"></div>
          <div class="w-12 bg-green-500 mt-1 rounded-t-md" style="height: {item.responses * 10}px;"></div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-2">{item.date.split('-').slice(1).join('-')}</div>
        </div>
      {/each}
    </div>
    <div class="flex justify-center gap-8 mt-4">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span class="text-sm text-slate-600 dark:text-slate-400">浏览量</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
        <span class="text-sm text-slate-600 dark:text-slate-400">回收量</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
        <span class="text-sm text-slate-600 dark:text-slate-400">回收率</span>
      </div>
    </div>
  </div>

  <!-- 分析卡片 -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- 地域位置 -->
    <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">地域位置</h3>
      <div class="h-48 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <!-- 中国地图占位 -->
        <div class="w-32 h-24 bg-blue-100 dark:bg-blue-900 rounded-md flex items-center justify-center">
          <span class="text-xs text-slate-500 dark:text-slate-400">中国地图</span>
        </div>
      </div>
      <div class="mt-4 space-y-2">
        {#each regionData.slice(0, 3) as region, i}
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-600 dark:text-slate-400">{region.name}</span>
            <span class="font-bold text-slate-900 dark:text-slate-100">{region.value} ({Math.round((region.value / responseCount) * 100)}%)</span>
          </div>
        {/each}
        {#if regionData.length > 3}
          <div class="text-xs text-slate-400 text-center">还有 {regionData.length - 3} 个地区...</div>
        {/if}
      </div>
    </div>

    <!-- 常用设备 -->
    <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">常用设备</h3>
      <div class="h-48 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <!-- 饼图占位 -->
        <div class="relative w-32 h-32">
          <div class="absolute inset-0 rounded-full border-8 border-green-500"></div>
          <div class="absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent border-r-transparent border-b-transparent"></div>
          <div class="absolute inset-0 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">{responseCount > 0 ? Math.round((deviceData.find(d => d.name === '移动设备')?.value || 0) / responseCount * 100) : 0}%</div>
        </div>
      </div>
      <div class="mt-4 space-y-2">
        {#each deviceData as device, i}
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-600 dark:text-slate-400">{device.name}</span>
            <span class="font-bold text-slate-900 dark:text-slate-100">{device.value} ({Math.round((device.value / responseCount) * 100)}%)</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- 常用系统 -->
    <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">常用系统</h3>
      <div class="h-48 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <!-- 饼图占位 -->
        <div class="relative w-32 h-32">
          <div class="absolute inset-0 rounded-full border-8 border-blue-500"></div>
          <div class="absolute inset-0 rounded-full border-8 border-pink-500 border-t-transparent"></div>
          <div class="absolute inset-0 rounded-full border-8 border-green-500 border-t-transparent border-r-transparent"></div>
          <div class="absolute inset-0 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">{responseCount > 0 ? Math.round((systemData.find(d => d.name === 'Android')?.value || 0) / responseCount * 100) : 0}%</div>
        </div>
      </div>
      <div class="mt-4 space-y-2">
        {#each systemData as system, i}
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-600 dark:text-slate-400">{system.name}</span>
            <span class="font-bold text-slate-900 dark:text-slate-100">{system.value} ({Math.round((system.value / responseCount) * 100)}%)</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- 渠道来源 -->
    <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">渠道来源</h3>
      <div class="h-48 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <!-- 饼图占位 -->
        <div class="relative w-32 h-32">
          <div class="absolute inset-0 rounded-full border-8 border-blue-500"></div>
          <div class="absolute inset-0 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">{responseCount > 0 ? Math.round((channelData.find(d => d.name === '直接访问')?.value || 0) / responseCount * 100) : 0}%</div>
        </div>
      </div>
      <div class="mt-4 space-y-2">
        {#each channelData as channel, i}
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-600 dark:text-slate-400">{channel.name}</span>
            <span class="font-bold text-slate-900 dark:text-slate-100">{channel.value} ({Math.round((channel.value / responseCount) * 100)}%)</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>