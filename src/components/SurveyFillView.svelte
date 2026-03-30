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
  const theme = $derived.by(() => survey.theme || { primaryColor: '#2563eb', backgroundColor: '#ffffff', textColor: '#1e293b', buttonTextColor: '#ffffff' });

  let formData = $state<Record<string, any>>({});

  const handleInputChange = (fieldId: string, value: any) => {
    formData[fieldId] = value;
  };

  const isFieldVisible = (field: Field) => {
    if (!field.logic) return true;
    const targetValue = formData[field.logic];
    if (!field.logicValue) return !!targetValue;
    return targetValue === field.logicValue;
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

    <form onsubmit={(e) => { e.preventDefault(); onSubmit(formData); }} class="space-y-16">
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
                  
                  {#if field.type === 'input'}
                    <input 
                      type="text" 
                      id={field.id}
                      placeholder={t.inputPlaceholder}
                      class="w-full p-4 border rounded-2xl outline-none transition-all"
                      style={{ 
                        backgroundColor: theme.backgroundColor === '#ffffff' ? '#f8fafc' : theme.backgroundColor,
                        borderColor: theme.textColor + '15',
                        color: theme.textColor
                      }}
                      value={formData[field.id] || ''}
                      oninput={(e) => handleInputChange(field.id, (e.target as HTMLInputElement).value)}
                    />
                  {:else if field.type === 'select'}
                    <select 
                      id={field.id}
                      class="w-full p-4 border rounded-2xl outline-none transition-all appearance-none"
                      style={{ 
                        backgroundColor: theme.backgroundColor === '#ffffff' ? '#f8fafc' : theme.backgroundColor,
                        borderColor: theme.textColor + '15',
                        color: theme.textColor
                      }}
                      value={formData[field.id] || ''}
                      onchange={(e) => handleInputChange(field.id, (e.target as HTMLSelectElement).value)}
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
                            borderColor: formData[field.id] === opt ? theme.primaryColor : theme.textColor + '15'
                          }}
                        >
                          <input 
                            type="radio" 
                            id={`${field.id}-${opt}`}
                            name={field.id}
                            class="w-5 h-5"
                            style={{ accentColor: theme.primaryColor }}
                            checked={formData[field.id] === opt}
                            onchange={() => handleInputChange(field.id, opt)}
                          />
                          <span class="text-sm font-medium opacity-80">{opt}</span>
                        </label>
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
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <div 
                          class="w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all"
                          style={{ 
                            backgroundColor: theme.backgroundColor === '#ffffff' ? '#f8fafc' : theme.backgroundColor,
                            borderColor: theme.textColor + '15'
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
        onclick={() => onSubmit(formData)}
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