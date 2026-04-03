<script lang="ts">
  import { ArrowLeft, Upload } from 'lucide-svelte';
  import { TRANSLATIONS } from '../i18n';
  import type { Language } from '../i18n';
  import type { Field, Survey } from '../types';

  interface Props {
    survey: Survey;
    onBack: () => void;
    onSubmit: (data: Record<string, any>) => void;
    language: string;
  }

  let { survey, onBack, onSubmit, language } = $props<Props>();

  const t = $derived.by(() => TRANSLATIONS[(language as Language) || '简体中文']);
  const activeSchema = $derived.by(() => survey.publishedSchema || survey.schema);
  const theme = $derived.by(() => {
    const finalTheme = survey.theme || { primaryColor: '#2563eb', backgroundColor: '#ffffff', textColor: '#1e293b', buttonTextColor: '#ffffff' };
    console.log('SurveyFillView theme applied:', finalTheme);
    return finalTheme;
  });

  let formData = $state<Record<string, any>>({});
  let syncWorker: SharedWorker | null = null;
  let syncPort: MessagePort | null = null;

  // 初始化 SharedWorker
  const initSyncWorker = () => {
    if (typeof SharedWorker === 'undefined') {
      console.warn('SharedWorker is not supported in this browser');
      return;
    }

    try {
      // 创建 SharedWorker 连接
      syncWorker = new SharedWorker('/survey-sync.worker.js');
      syncPort = syncWorker.port;

      // 监听来自 Worker 的消息
      syncPort.onmessage = (e) => {
        const { type, data } = e.data;
        if (type === 'sync') {
          // 同步来自其他标签页的数据
          formData = { ...data };
        }
      };

      // 初始化连接，关联到当前问卷
      syncPort.start();
      syncPort.postMessage({
        type: 'init',
        data: { surveyId: survey.id }
      });
    } catch (error) {
      console.error('Failed to initialize SharedWorker:', error);
      syncWorker = null;
      syncPort = null;
    }
  };

  // 发送数据更新到 Worker
  const sendDataUpdate = (newData: Record<string, any>) => {
    if (syncPort) {
      try {
        // 序列化数据以避免 DataCloneError
        const serializedData = JSON.parse(JSON.stringify(newData));
        syncPort.postMessage({
          type: 'update',
          data: serializedData
        });
      } catch (e) {
        console.error('Failed to serialize data for worker:', e);
      }
    }
  };

  // 清理 SharedWorker 连接
  const cleanupSyncWorker = () => {
    if (syncPort) {
      syncPort.postMessage({
        type: 'disconnect'
      });
      syncPort.close();
      syncPort = null;
    }
    syncWorker = null;
  };

  // 初始化 Worker
  initSyncWorker();

  // 组件卸载时清理 Worker
  $effect(() => {
    return () => {
      cleanupSyncWorker();
    };
  });

  const handleInputChange = (fieldId: string, value: any) => {
    formData[fieldId] = value;
    // 发送更新到其他标签页
    sendDataUpdate(formData);
  };

  const isFieldVisible = (field: Field) => {
    if (!field.logic) return true;
    const targetValue = formData[field.logic];
    if (!field.logicValue) return !!targetValue;
    return targetValue === field.logicValue;
  };

  // 校验必填项
  let invalidFields = $state<Set<string>>(new Set());
  
  const validateForm = (): boolean => {
    invalidFields = new Set();
    let isValid = true;
    
    activeSchema.sections.forEach(section => {
      section.fields.forEach(field => {
        if (isFieldVisible(field) && field.required) {
          const value = formData[field.id];
          
          // 根据字段类型进行校验
          if (field.type === 'checkbox') {
            // 复选框至少选择一个
            if (!value || (Array.isArray(value) && value.length === 0)) {
              isValid = false;
              invalidFields.add(field.id);
            }
          } else if (field.type === 'rating') {
            // 评分至少选择1星
            if (!value || Number(value) === 0) {
              isValid = false;
              invalidFields.add(field.id);
            }
          } else if (field.type === 'image') {
            // 图片上传必须上传文件
            if (!value) {
              isValid = false;
              invalidFields.add(field.id);
            }
          } else {
            // 其他类型字段不能为空
            if (!value || (typeof value === 'string' && value.trim() === '')) {
              isValid = false;
              invalidFields.add(field.id);
            }
          }
        }
      });
    });
    
    return isValid;
  };
</script>

<div 
  class="flex-grow flex flex-col overflow-y-auto"
  style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
>
  <div class="max-w-3xl mx-auto w-full py-20 px-6">
    <button 
      onclick={onBack} 
      class="mb-8 flex items-center gap-2 transition-colors text-xs font-bold uppercase tracking-widest"
      style={{ color: theme.textColor + '80' }}
    >
      <ArrowLeft class="w-4 h-4" /> 返回管理页
    </button>

    <div class="mb-12">
      <div class="flex items-center gap-3 mb-4">
        <h1 class="text-4xl font-black">{survey.title}</h1>
        <span 
          class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
          style={{ backgroundColor: theme.primaryColor + '15', color: theme.primaryColor }}
        >
          V{survey.version || 1}
        </span>
      </div>
      <p class="text-lg opacity-70">{survey.description}</p>
    </div>

    <form onsubmit={(e) => { e.preventDefault(); if (validateForm()) { onSubmit(formData); } }} class="space-y-16">
      {#each activeSchema.sections as section}
        <div key={section.id} class="space-y-8">
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-black shrink-0">{section.title}</h2>
            <div class="h-px flex-grow" style={{ backgroundColor: theme.textColor + '15' }} />
          </div>

          <div class="space-y-10">
            {#each section.fields as field}
              {#if isFieldVisible(field)}
                <div key={field.id} class="space-y-4">
                  <label for={field.id} class="block text-sm font-bold opacity-90">
                    {field.label} {#if field.required}<span class="text-red-500">*</span>{/if}
                  </label>
                  
                  {#if field.type === 'input' || field.type === 'email' || field.type === 'tel' || field.type === 'url'}
                    <input 
                      type={field.type}
                      id={field.id}
                      placeholder={field.type === 'email' ? '请输入邮箱地址' : field.type === 'tel' ? '请输入电话号码' : field.type === 'url' ? '请输入网址' : t.inputPlaceholder}
                      class="w-full p-4 border rounded-2xl outline-none transition-all"
                      style={{ 
                        backgroundColor: theme.backgroundColor === '#ffffff' ? '#f8fafc' : theme.backgroundColor,
                        borderColor: invalidFields.has(field.id) ? '#ef4444' : theme.textColor + '30',
                        color: theme.textColor
                      }}
                      value={formData[field.id] || ''}
                      oninput={(e) => {
                        handleInputChange(field.id, (e.target as HTMLInputElement).value);
                        if (invalidFields.has(field.id)) {
                          invalidFields.delete(field.id);
                        }
                      }}
                    />
                  {:else if field.type === 'textarea'}
                    <textarea 
                      id={field.id}
                      placeholder="请输入您的回答..."
                      class="w-full p-4 border rounded-2xl outline-none transition-all min-h-[120px] resize-none"
                      style={{ 
                        backgroundColor: theme.backgroundColor === '#ffffff' ? '#f8fafc' : theme.backgroundColor,
                        borderColor: invalidFields.has(field.id) ? '#ef4444' : theme.textColor + '30',
                        color: theme.textColor
                      }}
                      value={formData[field.id] || ''}
                      oninput={(e) => handleInputChange(field.id, (e.target as HTMLTextAreaElement).value)}
                    />
                  {:else if field.type === 'select'}
                    <select 
                      id={field.id}
                      class="w-full p-4 border rounded-2xl outline-none transition-all appearance-none"
                      style={{ 
                        backgroundColor: theme.backgroundColor === '#ffffff' ? '#f8fafc' : theme.backgroundColor,
                        borderColor: invalidFields.has(field.id) ? '#ef4444' : theme.textColor + '30',
                        color: theme.textColor
                      }}
                      value={formData[field.id] || ''}
                      onchange={(e) => {
                        handleInputChange(field.id, (e.target as HTMLSelectElement).value);
                        if (invalidFields.has(field.id)) {
                          invalidFields.delete(field.id);
                        }
                      }}
                    >
                      <option value="">{t.selectPlaceholder}</option>
                      <option value="opt1">{t.optionA}</option>
                      <option value="opt2">{t.optionB}</option>
                      <option value="opt3">{t.optionC}</option>
                    </select>
                  {:else if field.type === 'radio'}
                    <div class="space-y-3">
                      {#each [t.optionA, t.optionB, t.optionC] as opt, idx}
                        <label 
                          for={`${field.id}-${opt}`} 
                          class="flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all"
                          style={{ 
                            backgroundColor: formData[field.id] === opt ? theme.primaryColor + '10' : (theme.backgroundColor === '#ffffff' ? '#f8fafc' : theme.backgroundColor),
                            borderColor: formData[field.id] === opt ? theme.primaryColor : theme.textColor + '30'
                          }}
                        >
                          <input 
                            type="radio" 
                            id={`${field.id}-${opt}`}
                            name={field.id}
                            class="w-5 h-5"
                            style={{ accentColor: theme.primaryColor }}
                            checked={formData[field.id] === opt}
                            onchange={() => {
                              handleInputChange(field.id, opt);
                              if (invalidFields.has(field.id)) {
                                invalidFields.delete(field.id);
                              }
                            }}
                          />
                          <span class="text-sm font-medium opacity-80">{opt}</span>
                        </label>
                      {/each}
                    </div>
                  {:else if field.type === 'checkbox'}
                    <div class="space-y-3">
                      {#each [t.optionA, t.optionB, t.optionC] as opt, idx}
                        <label 
                          for={`${field.id}-${opt}`} 
                          class="flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all"
                          style={{ 
                            backgroundColor: (formData[field.id] as string[] || []).includes(opt) ? theme.primaryColor + '10' : (theme.backgroundColor === '#ffffff' ? '#f8fafc' : theme.backgroundColor),
                            borderColor: (formData[field.id] as string[] || []).includes(opt) ? theme.primaryColor : theme.textColor + '30'
                          }}
                        >
                          <input 
                            type="checkbox" 
                            id={`${field.id}-${opt}`}
                            name={field.id}
                            class="w-5 h-5"
                            style={{ accentColor: theme.primaryColor }}
                            checked={(formData[field.id] as string[] || []).includes(opt)}
                            onchange={(e) => {
                              const current = formData[field.id] as string[] || [];
                              if ((e.target as HTMLInputElement).checked) {
                                handleInputChange(field.id, [...current, opt]);
                              } else {
                                handleInputChange(field.id, current.filter(item => item !== opt));
                              }
                              if (invalidFields.has(field.id)) {
                                invalidFields.delete(field.id);
                              }
                            }}
                          />
                          <span class="text-sm font-medium opacity-80">{opt}</span>
                        </label>
                      {/each}
                    </div>
                  {:else if field.type === 'date'}
                    <input 
                      type="date"
                      id={field.id}
                      class="w-full p-4 border rounded-2xl outline-none transition-all"
                      style={{ 
                        backgroundColor: theme.backgroundColor === '#ffffff' ? '#f8fafc' : theme.backgroundColor,
                        borderColor: invalidFields.has(field.id) ? '#ef4444' : theme.textColor + '30',
                        color: theme.textColor
                      }}
                      value={formData[field.id] || ''}
                      onchange={(e) => {
                        handleInputChange(field.id, (e.target as HTMLInputElement).value);
                        if (invalidFields.has(field.id)) {
                          invalidFields.delete(field.id);
                        }
                      }}
                    />
                  {:else if field.type === 'number'}
                    <input 
                      type="number"
                      id={field.id}
                      placeholder="请输入数字"
                      class="w-full p-4 border rounded-2xl outline-none transition-all"
                      style={{ 
                        backgroundColor: theme.backgroundColor === '#ffffff' ? '#f8fafc' : theme.backgroundColor,
                        borderColor: invalidFields.has(field.id) ? '#ef4444' : theme.textColor + '30',
                        color: theme.textColor
                      }}
                      value={formData[field.id] || ''}
                      oninput={(e) => {
                        handleInputChange(field.id, (e.target as HTMLInputElement).value);
                        if (invalidFields.has(field.id)) {
                          invalidFields.delete(field.id);
                        }
                      }}
                    />
                  {:else if field.type === 'rating'}
                    <div class="flex items-center gap-2">
                      {#each [1, 2, 3, 4, 5] as star}
                        <button 
                          type="button"
                          class="text-2xl transition-colors"
                          style={{ 
                            color: star <= (Number(formData[field.id]) || 0) ? theme.primaryColor : theme.textColor + '30',
                            cursor: 'pointer'
                          }}
                          onclick={() => {
                            handleInputChange(field.id, star);
                            if (invalidFields.has(field.id)) {
                              invalidFields.delete(field.id);
                            }
                          }}
                        >
                          ★
                        </button>
                      {/each}
                    </div>
                  {:else if field.type === 'image'}
                    <div class="space-y-4">
                      <div class="relative group">
                        <input 
                          type="file" 
                          id={field.id}
                          accept="image/*"
                          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onchange={(e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                handleInputChange(field.id, reader.result);
                                if (invalidFields.has(field.id)) {
                                  invalidFields.delete(field.id);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <div 
                          class="w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all"
                          style={{ 
                            backgroundColor: theme.backgroundColor === '#ffffff' ? '#f8fafc' : theme.backgroundColor,
                            borderColor: invalidFields.has(field.id) ? '#ef4444' : theme.textColor + '15'
                          }}
                        >
                          {#if formData[field.id]}
                            <div class="relative w-full px-10">
                              <img 
                                src={formData[field.id]} 
                                alt="Preview" 
                                class="max-h-48 mx-auto rounded-xl shadow-lg"
                                referrerPolicy="no-referrer"
                              />
                              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl">
                                <span class="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full">{t.changeImage}</span>
                              </div>
                            </div>
                          {:else}
                              <div 
                                class="w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center transition-colors"
                                style={{ backgroundColor: theme.backgroundColor, color: theme.textColor + '40' }}
                              >
                                <Upload class="w-6 h-6" />
                              </div>
                              <div class="text-center">
                                <p class="text-sm font-bold opacity-80">{t.uploadImage}</p>
                                <p class="text-[10px] opacity-40 mt-1 uppercase tracking-widest">{t.uploadDesc}</p>
                              </div>
                          {/if}
                        </div>
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/each}
    </form>

    <div class="mt-20 pt-10 border-t" style={{ borderColor: theme.textColor + '15' }}>
      <button 
        onclick={() => {
          if (validateForm()) {
            onSubmit(formData);
          }
        }}
        class="w-full py-5 rounded-[2rem] font-black text-lg shadow-2xl transition-all transform hover:-translate-y-1"
        style={{ 
          backgroundColor: theme.primaryColor, 
          color: theme.buttonTextColor,
          boxShadow: `0 20px 40px ${theme.primaryColor}33`
        }}
      >
        {t.submitSurvey}
      </button>
      <p class="text-center text-[10px] mt-6 uppercase tracking-widest font-bold opacity-30">
        Powered by InsightFlow LowCode Engine
      </p>
    </div>
  </div>
</div>