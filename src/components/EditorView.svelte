<script lang="ts">
  import { ArrowLeft, Save, Play, Type, ListIcon, CheckCircle, ImageIcon, Plus, MousePointer2, Radio, FileText, CheckSquare, Calendar, Hash, Star, Mail, Phone, Link } from 'lucide-svelte';
  import { TRANSLATIONS } from '../i18n';
  import type { Language } from '../i18n';
  import type { Field, Survey } from '../types';
  import { PREDEFINED_PALETTES } from '../constants';

  interface Props {
    survey: Survey;
    onBack: () => void;
    onUpdateSurvey: (updates: Partial<Survey>) => void;
    selectedSecId: string | null;
    setSelectedSecId: (id: string | null) => void;
    selectedFldId: string | null;
    setSelectedFldId: (id: string | null) => void;
    addSection: () => void;
    onDrop: (e: DragEvent, secId: string) => void;
    primaryColor: string;
    language: string;
  }

  // 添加主题变更的防抖处理
  let themeUpdateTimeout: number | null = null;
  const debouncedThemeUpdate = (updates: Partial<Survey>) => {
    if (themeUpdateTimeout) {
      clearTimeout(themeUpdateTimeout);
    }
    themeUpdateTimeout = window.setTimeout(() => {
      onUpdateSurvey(updates);
    }, 100);
  };

  let { 
    survey, 
    onBack, 
    onUpdateSurvey, 
    selectedSecId, 
    setSelectedSecId, 
    selectedFldId, 
    setSelectedFldId,
    addSection,
    onDrop,
    primaryColor,
    language
  } = $props<Props>();

  const t = $derived.by(() => TRANSLATIONS[(language as Language) || '简体中文']);
  let leftTab = $state<'components' | 'theme'>('components');
  let dragOverSectionId = $state<string | null>(null);
  let dragOverFieldId = $state<string | null>(null);
  let draggedFieldId = $state<string | null>(null);
  let draggedFieldSectionId = $state<string | null>(null);
  const currentSection = $derived.by(() => survey.schema.sections.find((s: any) => s.id === selectedSecId));
  const currentField = $derived.by(() => currentSection?.fields.find((f: any) => f.id === selectedFldId));

  const updateField = (secId: string, fldId: string, updates: Partial<Field>) => {
    onUpdateSurvey({
      schema: {
        ...survey.schema,
        sections: survey.schema.sections.map((s: any) => 
          s.id === secId 
            ? { ...s, fields: s.fields.map((f: any) => f.id === fldId ? { ...f, ...updates } : f) } 
            : s
        )
      }
    });
  };

  const updateSection = (secId: string, updates: any) => {
    onUpdateSurvey({
      schema: {
        ...survey.schema,
        sections: survey.schema.sections.map((s: any) => s.id === secId ? { ...s, ...updates } : s)
      }
    });
  };

  const deleteField = (secId: string, fldId: string) => {
    onUpdateSurvey({
      schema: {
        ...survey.schema,
        sections: survey.schema.sections.map((s: any) => 
          s.id === secId 
            ? { ...s, fields: s.fields.filter((f: any) => f.id !== fldId) } 
            : s
        )
      }
    });
    setSelectedFldId(null);
  };

  const reorderFields = (fromSecId: string, fromIndex: number, toSecId: string, toIndex: number) => {
    const newSections = [...survey.schema.sections];
    
    // 从原章节中移除字段
    const [movedField] = newSections.find(s => s.id === fromSecId)!.fields.splice(fromIndex, 1);
    
    // 添加到目标章节
    newSections.find(s => s.id === toSecId)!.fields.splice(toIndex, 0, movedField);
    
    onUpdateSurvey({
      schema: {
        ...survey.schema,
        sections: newSections
      }
    });
  };
</script>

<div class="flex flex-col h-full">
  <header class="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-50">
    <div class="flex items-center gap-4">
        <button onclick={onBack} class="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div class="h-6 w-px bg-slate-200 mx-2" />
        <input 
            type="text" 
            value={survey.title}
            oninput={(e) => onUpdateSurvey({ title: (e.target as HTMLInputElement).value })}
            class="text-sm font-bold bg-transparent border-none outline-none focus:ring-0 w-64"
          />
      </div>
      <div class="flex gap-3">
        <button 
          onclick={onBack}
          class="px-4 py-2 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2"
        >
          <Save class="w-4 h-4" /> {t.saveDraft}
        </button>
        <button 
          onclick={() => {
            // 调试日志：查看发布时的数据
            console.log('Publishing survey with theme:', survey.theme);
            
            onUpdateSurvey({ 
              status: 'published',
              publishedSchema: JSON.parse(JSON.stringify(survey.schema)),
              version: (survey.version || 1) + 1,
              // 确保 theme 也被保存
              theme: survey.theme || {
                primaryColor: '#2563eb',
                backgroundColor: '#ffffff',
                textColor: '#1e293b',
                buttonTextColor: '#ffffff'
              }
            });
            onBack();
          }}
          class="px-6 py-2 text-slate-800 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
          style={{ 
            backgroundColor: primaryColor,
            boxShadow: `0 10px 15px -3px ${primaryColor}33`
          }}
        >
          <Play class="w-4 h-4" /> {t.publishNew}
        </button>
      </div>
  </header>

  <div class="flex-grow flex overflow-hidden">
    <aside class="w-64 bg-white border-r border-slate-100 flex flex-col overflow-hidden">
      <div class="flex border-b">
        <button 
          onclick={() => leftTab = 'components'}
          class={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
            leftTab === 'components' ? 'border-b-2' : 'text-slate-400 hover:text-slate-600'
          }`}
          style={leftTab === 'components' ? { color: primaryColor, borderBottomColor: primaryColor } : {}}
        >
          {t.components}
        </button>
        <button 
          onclick={() => leftTab = 'theme'}
          class={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
            leftTab === 'theme' ? 'border-b-2' : 'text-slate-400 hover:text-slate-600'
          }`}
          style={leftTab === 'theme' ? { color: primaryColor, borderBottomColor: primaryColor } : {}}
        >
          {t.theme}
        </button>
      </div>

      <div class="flex-grow overflow-y-auto p-6">
        {#if leftTab === 'components'}
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{t.draggableComponents}</h3>
            <div class="space-y-3">
              <div 
                draggable="true"
                class="p-3 border border-slate-100 rounded-xl cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                ondragstart={(e) => e.dataTransfer.setData('type', 'input')}
              >
                <div class="flex items-center gap-2">
                  <Type class="w-4 h-4" style={{ color: primaryColor }} />
                  <span class="text-sm font-bold">{t.singleLineInput}</span>
                </div>
              </div>
              <div 
                draggable="true"
                class="p-3 border border-slate-100 rounded-xl cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                ondragstart={(e) => e.dataTransfer.setData('type', 'textarea')}
              >
                <div class="flex items-center gap-2">
                  <FileText class="w-4 h-4" style={{ color: primaryColor }} />
                  <span class="text-sm font-bold">多行文本输入</span>
                </div>
              </div>
              <div 
                draggable="true"
                class="p-3 border border-slate-100 rounded-xl cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                ondragstart={(e) => e.dataTransfer.setData('type', 'select')}
              >
                <div class="flex items-center gap-2">
                  <ListIcon class="w-4 h-4" style={{ color: primaryColor }} />
                  <span class="text-sm font-bold">{t.dropdownSelect}</span>
                </div>
              </div>
              <div 
                draggable="true"
                class="p-3 border border-slate-100 rounded-xl cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                ondragstart={(e) => e.dataTransfer.setData('type', 'radio')}
              >
                <div class="flex items-center gap-2">
                  <Radio class="w-4 h-4" style={{ color: primaryColor }} />
                  <span class="text-sm font-bold">{t.radioSelect}</span>
                </div>
              </div>
              <div 
                draggable="true"
                class="p-3 border border-slate-100 rounded-xl cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                ondragstart={(e) => e.dataTransfer.setData('type', 'checkbox')}
              >
                <div class="flex items-center gap-2">
                  <CheckSquare class="w-4 h-4" style={{ color: primaryColor }} />
                  <span class="text-sm font-bold">复选框组</span>
                </div>
              </div>
              <div 
                draggable="true"
                class="p-3 border border-slate-100 rounded-xl cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                ondragstart={(e) => e.dataTransfer.setData('type', 'date')}
              >
                <div class="flex items-center gap-2">
                  <Calendar class="w-4 h-4" style={{ color: primaryColor }} />
                  <span class="text-sm font-bold">日期选择器</span>
                </div>
              </div>
              <div 
                draggable="true"
                class="p-3 border border-slate-100 rounded-xl cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                ondragstart={(e) => e.dataTransfer.setData('type', 'number')}
              >
                <div class="flex items-center gap-2">
                  <Hash class="w-4 h-4" style={{ color: primaryColor }} />
                  <span class="text-sm font-bold">数字输入</span>
                </div>
              </div>
              <div 
                draggable="true"
                class="p-3 border border-slate-100 rounded-xl cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                ondragstart={(e) => e.dataTransfer.setData('type', 'rating')}
              >
                <div class="flex items-center gap-2">
                  <Star class="w-4 h-4" style={{ color: primaryColor }} />
                  <span class="text-sm font-bold">星级评分</span>
                </div>
              </div>
              <div 
                draggable="true"
                class="p-3 border border-slate-100 rounded-xl cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                ondragstart={(e) => e.dataTransfer.setData('type', 'email')}
              >
                <div class="flex items-center gap-2">
                  <Mail class="w-4 h-4" style={{ color: primaryColor }} />
                  <span class="text-sm font-bold">邮箱输入</span>
                </div>
              </div>
              <div 
                draggable="true"
                class="p-3 border border-slate-100 rounded-xl cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                ondragstart={(e) => e.dataTransfer.setData('type', 'tel')}
              >
                <div class="flex items-center gap-2">
                  <Phone class="w-4 h-4" style={{ color: primaryColor }} />
                  <span class="text-sm font-bold">电话输入</span>
                </div>
              </div>
              <div 
                draggable="true"
                class="p-3 border border-slate-100 rounded-xl cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                ondragstart={(e) => e.dataTransfer.setData('type', 'url')}
              >
                <div class="flex items-center gap-2">
                  <Link class="w-4 h-4" style={{ color: primaryColor }} />
                  <span class="text-sm font-bold">网址输入</span>
                </div>
              </div>
              <div 
                draggable="true"
                class="p-3 border border-slate-100 rounded-xl cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                ondragstart={(e) => e.dataTransfer.setData('type', 'image')}
              >
                <div class="flex items-center gap-2">
                  <ImageIcon class="w-4 h-4" style={{ color: primaryColor }} />
                  <span class="text-sm font-bold">{t.imageUpload}</span>
                </div>
              </div>
            </div>
        {:else}
          <div class="space-y-8">
            <div>
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.presetPalettes}</h3>
              <div class="grid grid-cols-2 gap-3">
                {#each PREDEFINED_PALETTES as p}
                  <button 
                    key={p.nameKey}
                    onclick={() => {
                      console.log('Applying theme:', p);
                      debouncedThemeUpdate({ 
                        theme: { 
                          primaryColor: p.primary, 
                          backgroundColor: p.bg, 
                          textColor: p.text, 
                          buttonTextColor: p.btnText 
                        } 
                      });
                    }}
                    class="p-3 border border-slate-100 rounded-xl transition-all duration-300 text-left group hover:shadow-md"
                    onmouseenter={(e) => e.currentTarget.style.borderColor = p.primary}
                    onmouseleave={(e) => e.currentTarget.style.borderColor = ''}
                  >
                    <div class="flex gap-2 mb-3">
                      <div class="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: p.primary }} />
                      <div class="w-4 h-4 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: p.bg }} />
                    </div>
                    <span class="text-[10px] font-bold text-slate-600 transition-colors duration-300" 
                      onmouseenter={(e) => e.currentTarget.style.color = p.primary} 
                      onmouseleave={(e) => e.currentTarget.style.color = ''}
                    >
                      {t[p.nameKey as keyof typeof t]}
                    </span>
                  </button>
                {/each}
              </div>
            </div>

            <div class="space-y-4">
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.customColors}</h3>
              {#each [
                { label: t.primaryColor, key: 'primaryColor' },
                { label: t.backgroundColor, key: 'backgroundColor' },
                { label: t.textColor, key: 'textColor' },
                { label: t.buttonTextColor, key: 'buttonTextColor' },
              ] as c}
                <div key={c.key} class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-600">{c.label}</span>
                  <input 
                    type="color" 
                    value={survey.theme?.[c.key as keyof typeof survey.theme] || '#000000'}
                    onchange={(e) => {
                      const currentTheme = survey.theme || {
                        primaryColor: '#2563eb',
                        backgroundColor: '#ffffff',
                        textColor: '#1e293b',
                        buttonTextColor: '#ffffff'
                      };
                      debouncedThemeUpdate({ 
                        theme: { ...currentTheme, [c.key]: e.target.value } 
                      });
                    }}
                    class="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                  />
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </aside>

    <main 
      class="flex-grow p-10 overflow-y-auto space-y-10"
      style={{ backgroundColor: survey.theme?.backgroundColor || '#f8fafc' }}
      onclick={() => { setSelectedSecId(null); setSelectedFldId(null); }}
    >
      {#each survey.schema.sections as section}
        <div 
          key={section.id}
          class="border-2 border-slate-200 rounded-xl p-6 mb-6 transition-all"
          style={{
            backgroundColor: survey.theme?.backgroundColor || '#ffffff',
            borderColor: dragOverSectionId === section.id 
              ? 'rgba(100, 116, 139, 1)' 
              : (selectedSecId === section.id && !selectedFldId 
                ? primaryColor || '#2563eb' 
                : 'rgba(175, 184, 197, 1)'),
            borderStyle: dragOverSectionId === section.id ? 'dashed' : 'solid',
            ...(dragOverSectionId === section.id ? { backgroundColor: 'rgba(100, 116, 139, 0.05)' } : {})
          }}
          onclick={() => { setSelectedSecId(section.id); setSelectedFldId(null); }}
          ondrop={(e) => {
            dragOverSectionId = null;
            onDrop(e, section.id);
          }}
          ondragover={(e) => {
            e.preventDefault();
            dragOverSectionId = section.id;
          }}
          ondragleave={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
              dragOverSectionId = null;
            }
          }}
        >
          <h3 class="text-lg font-bold mb-4">{section.title}</h3>
          <div class="space-y-4">
            {#each section.fields as field}
              <div 
                key={field.id}
                class="p-4 border border-slate-200 rounded-lg flex items-center justify-between cursor-move"
                draggable="true"
                style={{
                  backgroundColor: survey.theme?.backgroundColor || '#ffffff',
                  borderColor: dragOverFieldId === field.id 
                    ? primaryColor || '#2563eb' 
                    : selectedFldId === field.id 
                    ? primaryColor || '#2563eb' 
                    : 'rgba(175, 184, 197, 1)',
                  borderStyle: dragOverFieldId === field.id ? 'dashed' : 'solid',
                  ...(selectedFldId === field.id ? { backgroundColor: `${primaryColor || '#2563eb'}05` } : {}),
                  ...(dragOverFieldId === field.id ? { backgroundColor: `${primaryColor || '#2563eb'}05` } : {})
                }}
                onclick={(e) => {
                  e.stopPropagation();
                  setSelectedSecId(section.id);
                  setSelectedFldId(field.id);
                }}
                ondragstart={(e) => {
                  e.dataTransfer.setData('fieldId', field.id);
                  e.dataTransfer.setData('sectionId', section.id);
                  draggedFieldId = field.id;
                  draggedFieldSectionId = section.id;
                }}
                ondragover={(e) => {
                  e.preventDefault();
                  dragOverFieldId = field.id;
                }}
                ondrop={(e) => {
                  e.preventDefault();
                  const fromFieldId = e.dataTransfer.getData('fieldId');
                  const fromSectionId = e.dataTransfer.getData('sectionId');
                  
                  if (fromFieldId !== field.id) {
                    const fromSection = survey.schema.sections.find((s: any) => s.id === fromSectionId);
                    const toSection = survey.schema.sections.find((s: any) => s.id === section.id);
                    
                    if (fromSection && toSection) {
                      const fromIndex = fromSection.fields.findIndex((f: any) => f.id === fromFieldId);
                      const toIndex = toSection.fields.findIndex((f: any) => f.id === field.id);
                      
                      reorderFields(fromSectionId, fromIndex, section.id, toIndex);
                    }
                  }
                  
                  dragOverFieldId = null;
                  draggedFieldId = null;
                  draggedFieldSectionId = null;
                }}
                ondragleave={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const x = e.clientX;
                  const y = e.clientY;
                  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                    dragOverFieldId = null;
                  }
                }}
              >
                <div class="flex items-center gap-2">
                  {#if field.type === 'input'}<Type class="w-4 h-4" style={{ color: primaryColor }} />{/if}
                  {#if field.type === 'textarea'}<FileText class="w-4 h-4" style={{ color: primaryColor }} />{/if}
                  {#if field.type === 'select'}<ListIcon class="w-4 h-4" style={{ color: primaryColor }} />{/if}
                  {#if field.type === 'radio'}<CheckCircle class="w-4 h-4" style={{ color: primaryColor }} />{/if}
                  {#if field.type === 'checkbox'}<CheckSquare class="w-4 h-4" style={{ color: primaryColor }} />{/if}
                  {#if field.type === 'date'}<Calendar class="w-4 h-4" style={{ color: primaryColor }} />{/if}
                  {#if field.type === 'number'}<Hash class="w-4 h-4" style={{ color: primaryColor }} />{/if}
                  {#if field.type === 'rating'}<Star class="w-4 h-4" style={{ color: primaryColor }} />{/if}
                  {#if field.type === 'email'}<Mail class="w-4 h-4" style={{ color: primaryColor }} />{/if}
                  {#if field.type === 'tel'}<Phone class="w-4 h-4" style={{ color: primaryColor }} />{/if}
                  {#if field.type === 'url'}<Link class="w-4 h-4" style={{ color: primaryColor }} />{/if}
                  {#if field.type === 'image'}<ImageIcon class="w-4 h-4" style={{ color: primaryColor }} />{/if}
                  <span>{field.label}</span>
                  {#if field.required}<span class="text-red-500">*</span>{/if}
                </div>
                <button 
                  onclick={(e) => {
                    e.stopPropagation();
                    deleteField(section.id, field.id);
                  }}
                  class="opacity-0 hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                  title="删除题目"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/each}
      <button 
        onclick={addSection}
        class="w-full py-6 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-slate-400 font-bold text-sm transition-all flex items-center justify-center gap-2"
        onmouseenter={(e) => {
          e.currentTarget.style.borderColor = primaryColor;
          e.currentTarget.style.color = primaryColor;
          e.currentTarget.style.backgroundColor = `${primaryColor}08`;
        }}
        onmouseleave={(e) => {
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.color = '';
          e.currentTarget.style.backgroundColor = '';
        }}
      >
        <Plus class="w-5 h-5" /> {t.addNewSection}
      </button>
    </main>

    <aside class="w-80 bg-white border-l border-slate-100 p-6 overflow-y-auto">
      <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">{t.propertiesPanel}</h3>
        {#if !selectedSecId}
          <div class="text-center py-20 text-slate-300">
            <MousePointer2 class="w-10 h-10 mx-auto mb-4 opacity-20" />
            <p class="text-xs">{t.clickToConfigure}</p>
          </div>
        {:else if selectedFldId && currentField}
          <div class="space-y-6">
            <div class="p-3 rounded-xl text-[10px] font-black uppercase" style={{ backgroundColor: `${primaryColor}11`, color: primaryColor }}>{t.editField}</div>
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase block mb-2">{t.fieldName}</label>
              <input 
                type="text" 
                value={currentField.label}
                onchange={(e) => updateField(selectedSecId, selectedFldId, { label: e.target.value })}
                class="w-full p-3 bg-slate-50 border rounded-xl outline-none text-sm transition-all"
              />
            </div>
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <span class="text-xs font-bold">{t.isRequired}</span>
              <input 
                type="checkbox" 
                checked={currentField.required}
                onchange={(e) => updateField(selectedSecId, selectedFldId, { required: e.target.checked })}
                class="w-5 h-5"
                style={{ accentColor: primaryColor }}
              />
            </div>
            <div>
              <label class="text-[10px] font-bold uppercase block mb-2" style={{ color: primaryColor }}>{t.logicJump}</label>
              <div class="space-y-2">
                <select 
                  value={currentField.logic}
                  onchange={(e) => updateField(selectedSecId, selectedFldId, { logic: e.target.value, logicValue: '' })}
                  class="w-full p-3 bg-slate-50 border rounded-xl text-xs outline-none"
                >
                  <option value="">{t.alwaysShow}</option>
                  {#each currentSection?.fields.filter((f: any) => f.id !== selectedFldId && (f.type === 'radio' || f.type === 'select')) as f}
                    <option key={f.id} value={f.id}>{t.dependsOn}: {f.label}</option>
                  {/each}
                </select>

                {#if currentField.logic}
                  <select 
                    value={currentField.logicValue}
                    onchange={(e) => updateField(selectedSecId, selectedFldId, { logicValue: e.target.value })}
                    class="w-full p-3 border rounded-xl text-xs outline-none"
                    style={{ backgroundColor: `${primaryColor}11`, borderColor: `${primaryColor}22`, color: primaryColor }}
                  >
                    <option value="">{t.selectTriggerValue}</option>
                    {#each [t.optionA, t.optionB, t.optionC] as opt}
                      <option key={opt} value={opt}>{t.showWhenAnswerIs.replace('{val}', opt)}</option>
                    {/each}
                  </select>
                {/if}
              </div>
            </div>
          </div>
        {:else if currentSection}
          <div class="space-y-6">
            <div class="p-3 rounded-xl text-[10px] font-black uppercase" style={{ backgroundColor: `${primaryColor}11`, color: primaryColor }}>{t.editSection}</div>
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase block mb-2">{t.sectionTitle}</label>
              <input 
                type="text" 
                value={currentSection.title}
                onchange={(e) => updateSection(selectedSecId, { title: e.target.value })}
                class="w-full p-3 bg-slate-50 border rounded-xl outline-none text-sm transition-all"
              />
            </div>
          </div>
        {/if}
    </aside>
  </div>
</div>