<script lang="ts">

  import { MessageSquare, Send, Loader2, Edit, Trash2, Bot } from 'lucide-svelte';
  import type { Survey, Schema, Section, Field } from '../types';
  import { t } from '../i18n';
  import { generateSurveyFromAI } from '../services/aiService';

  // Props
  const { onGenerate, onBack } = $props<{
    onGenerate: (survey: Survey) => void;
    onBack: () => void;
  }>();

  // State
  let message = '';
  let messages = $state<{ role: 'user' | 'assistant'; content: string }[]>([]);
  let isLoading = $state(false);
  let error = $state('');
  let generatedSurvey = $state<Survey | null>(null);

  // Derived
  const hasGeneratedSurvey = $derived(!!generatedSurvey);

  // Generate survey from AI
  const generateSurvey = async () => {
    console.log('generateSurvey called, message:', message);
    if (!message.trim()) {
      console.log('Message is empty, returning');
      return;
    }

    // Add user message
    messages = [...messages, { role: 'user', content: message }];
    const userMessage = message;
    message = '';
    isLoading = true;
    error = '';
    console.log('Starting AI generation with message:', userMessage);

    try {
      // Call Gemini AI API to generate survey
      console.log('Calling generateSurveyFromAI');
      const survey = await generateSurveyFromAI(userMessage);
      console.log('Survey generated successfully:', survey);
      generatedSurvey = survey;

      // Add assistant message
      messages = [...messages, { 
        role: 'assistant', 
        content: `我已经根据您的需求生成了一份问卷。\n\n标题：${survey.title}\n描述：${survey.description}\n章节数：${survey.schema.sections.length}\n问题数：${survey.schema.sections.reduce((total, section) => total + section.fields.length, 0)}` 
      }];
    } catch (err) {
      console.error('Error generating survey:', err);
      error = t.aiError;
      messages = [...messages, { role: 'assistant', content: t.aiError }];
    } finally {
      isLoading = false;
      console.log('Generation process completed, isLoading:', isLoading);
    }
  };



  // Edit generated survey
  const editSurvey = () => {
    if (generatedSurvey) {
      onGenerate(generatedSurvey);
    }
  };

  // Clear chat history
  const clearHistory = () => {
    messages = [];
    generatedSurvey = null;
    error = '';
  };

  // Regenerate survey
  const regenerateSurvey = () => {
    if (messages.length > 0) {
      const lastUserMessage = messages.findLast(m => m.role === 'user');
      if (lastUserMessage) {
        message = lastUserMessage.content;
        generateSurvey();
      }
    }
  };
</script>

<div class="flex-grow flex flex-col overflow-hidden">
  <div class="p-6 border-b" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <MessageSquare class="w-6 h-6" />
        <h1 class="text-2xl font-bold">{t.aiChat}</h1>
      </div>
      <button 
        onclick={onBack}
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)', color: 'rgba(0, 0, 0, 0.7)' }}
      >
        {t.backToLogin}
      </button>
    </div>
    <p class="mt-2 text-sm opacity-70">{t.aiChatDesc}</p>
  </div>

  <div class="flex-grow flex overflow-hidden">
    <!-- Chat area -->
    <div class="flex-grow flex flex-col overflow-hidden border-r" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
      <!-- Chat history -->
      <div class="flex-grow p-6 overflow-y-auto space-y-6">
        {#if messages.length === 0}
          <div class="flex flex-col items-center justify-center h-full text-center">
            <Bot class="w-16 h-16 mb-4 opacity-20" />
            <h3 class="text-lg font-semibold mb-2">{t.describeSurvey}</h3>
            <p class="text-sm opacity-70 max-w-md">{t.chatPlaceholder}</p>
          </div>
        {:else}
          {#each messages as msg, index}
            <div class={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div class={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                <p class="text-sm">{msg.content}</p>
              </div>
            </div>
          {/each}
          
          {#if isLoading}
            <div class="flex justify-start">
              <div class="max-w-[80%] p-4 rounded-2xl bg-gray-100 text-gray-800">
                <div class="flex items-center gap-2">
                  <Loader2 class="w-4 h-4 animate-spin" />
                  <span class="text-sm">{t.loading}</span>
                </div>
              </div>
            </div>
          {/if}
          
          {#if error}
            <div class="flex justify-start">
              <div class="max-w-[80%] p-4 rounded-2xl bg-red-100 text-red-800">
                <p class="text-sm">{error}</p>
              </div>
            </div>
          {/if}
        {/if}
      </div>

      <!-- Chat input -->
      <div class="p-6 border-t" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
        <div class="flex gap-3">
          <input
            type="text"
            bind:value={message}
            placeholder={t.chatPlaceholder}
            class="flex-grow p-4 border rounded-2xl outline-none transition-all"
            style={{ borderColor: 'rgba(0, 0, 0, 0.2)' }}
            onkeypress={(e) => e.key === 'Enter' && generateSurvey()}
          />
          <button
            onclick={generateSurvey}
            // disabled={!message.trim() || isLoading}
            class="p-4 rounded-2xl transition-all flex items-center justify-center"
            style={{ 
              backgroundColor: message.trim() && !isLoading ? '#2563eb' : 'rgba(0, 0, 0, 0.1)',
              color: message.trim() && !isLoading ? '#ffffff' : 'rgba(0, 0, 0, 0.4)',
              cursor: message.trim() && !isLoading ? 'pointer' : 'not-allowed'
            }}
          >
            {#if isLoading}
              <Loader2 class="w-5 h-5 animate-spin" />
            {:else}
              <Send class="w-5 h-5" />
            {/if}
          </button>
        </div>
        
        {#if messages.length > 0}
          <div class="mt-4 flex justify-between items-center">
            <button
              onclick={clearHistory}
              class="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              <Trash2 class="w-3 h-3" />
              {t.clearHistory}
            </button>
            
            {#if hasGeneratedSurvey}
              <button
                onclick={regenerateSurvey}
                class="flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Loader2 class="w-3 h-3" />
                {t.regenerate}
              </button>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Survey preview -->
    <div class="w-96 border-l" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
      <div class="p-6 border-b" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
        <h2 class="text-lg font-bold">{t.aiGenerated}</h2>
      </div>
      
      <div class="p-6 overflow-y-auto h-[calc(100%-64px)]">
        {#if hasGeneratedSurvey && generatedSurvey}
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold">{generatedSurvey.title}</h3>
              <p class="text-sm opacity-70 mt-1">{generatedSurvey.description}</p>
            </div>
            
            <div class="space-y-4">
              {#each generatedSurvey.schema.sections as section}
                <div>
                  <h4 class="font-medium mb-2">{section.title}</h4>
                  <div class="space-y-2 pl-4 border-l" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                    {#each section.fields as field}
                      <div class="text-sm">
                        {field.label} {field.required ? '*' : ''}
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
            
            <button
              onclick={editSurvey}
              class="w-full mt-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: '#2563eb',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Edit class="w-4 h-4" />
              {t.editGenerated}
            </button>
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare class="w-12 h-12 mb-3 opacity-20" />
            <p class="text-sm opacity-70">{t.noSurveyGenerated}</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
