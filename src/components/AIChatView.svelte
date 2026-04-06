<script lang="ts">

  import { MessageSquare, Send, Loader2, Edit, Trash2, Bot, Plus, Clock } from 'lucide-svelte';
  import type { Survey, Schema, Section, Field, ChatHistory, Message } from '../types';
  import { t } from '../i18n';
  import { generateSurveyFromAI, saveChatHistory, loadChatHistoryList, createNewChat, deleteChatHistory } from '../services/aiService';

  // Props
  const { onGenerate, onBack } = $props<{
    onGenerate: (survey: Survey) => void;
    onBack: () => void;
  }>();

  // State
  let message = '';
  let chatHistoryList = $state<ChatHistory[]>(loadChatHistoryList());
  let currentChat = $state<ChatHistory>(createNewChat());
  let isLoading = $state(false);
  let error = $state('');
  let showHistory = $state(false);

  // Derived
  const hasGeneratedSurvey = $derived(!!currentChat.generatedSurvey);
  const messages = $derived(currentChat.messages);
  const generatedSurvey = $derived(currentChat.generatedSurvey);

  // Load chat history on component mount
  chatHistoryList = loadChatHistoryList();

  // Generate survey from AI
  const generateSurvey = async () => {
    console.log('generateSurvey called, message:', message);
    if (!message.trim()) {
      console.log('Message is empty, returning');
      return;
    }

    // Add user message
    const newMessage: Message = { role: 'user', content: message, timestamp: Date.now() };
    currentChat.messages = [...currentChat.messages, newMessage];
    const userMessage = message;
    message = '';
    isLoading = true;
    error = '';
    console.log('Starting AI generation with message:', userMessage);

    try {
      // Call AI API to generate survey
      console.log('Calling generateSurveyFromAI');
      const survey = await generateSurveyFromAI(userMessage);
      console.log('Survey generated successfully:', survey);
      currentChat.generatedSurvey = survey;

      // Add assistant message
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: `我已经根据您的需求生成了一份问卷。\n\n标题：${survey.title}\n描述：${survey.description}\n章节数：${survey.schema.sections.length}\n问题数：${survey.schema.sections.reduce((total, section) => total + section.fields.length, 0)}`,
        timestamp: Date.now()
      };
      currentChat.messages = [...currentChat.messages, assistantMessage];

      // Update chat title with survey title
      currentChat.title = survey.title || '新对话';
      currentChat.updatedAt = Date.now();

      // Save chat history
      saveChatHistory(currentChat);
      chatHistoryList = loadChatHistoryList();
    } catch (err) {
      console.error('Error generating survey:', err);
      error = t.aiError;
      const errorMessage: Message = { 
        role: 'assistant', 
        content: t.aiError,
        timestamp: Date.now()
      };
      currentChat.messages = [...currentChat.messages, errorMessage];
      currentChat.updatedAt = Date.now();
      saveChatHistory(currentChat);
      chatHistoryList = loadChatHistoryList();
    } finally {
      isLoading = false;
      console.log('Generation process completed, isLoading:', isLoading);
    }
  };

  // Create new chat
  const startNewChat = () => {
    currentChat = createNewChat();
    message = '';
    error = '';
    showHistory = false;
  };

  // Load existing chat
  const loadChat = (chat: ChatHistory) => {
    currentChat = chat;
    message = '';
    error = '';
    showHistory = false;
  };

  // Delete chat
  const handleDeleteChat = (chatId: string, event: Event) => {
    event.stopPropagation();
    deleteChatHistory(chatId);
    chatHistoryList = loadChatHistoryList();
    if (currentChat.id === chatId) {
      currentChat = createNewChat();
      message = '';
      error = '';
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
    currentChat.messages = [];
    currentChat.generatedSurvey = null;
    currentChat.updatedAt = Date.now();
    saveChatHistory(currentChat);
    chatHistoryList = loadChatHistoryList();
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
      <div class="flex gap-2">
        <button 
          onclick={() => showHistory = !showHistory}
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)', color: 'rgba(0, 0, 0, 0.7)' }}
        >
          <Clock class="w-4 h-4" />
          历史记录
        </button>
        <button 
          onclick={startNewChat}
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
        >
          <Plus class="w-4 h-4" />
          新对话
        </button>
        <button 
          onclick={onBack}
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)', color: 'rgba(0, 0, 0, 0.7)' }}
        >
          {t.backToLogin}
        </button>
      </div>
    </div>
    <p class="mt-2 text-sm opacity-70">{t.aiChatDesc}</p>
  </div>

  <div class="flex-grow flex overflow-hidden">
    <!-- Chat history sidebar -->
    {#if showHistory}
      <div class="w-80 border-r overflow-y-auto" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
        <div class="p-4 border-b" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
          <h3 class="font-medium">对话历史</h3>
        </div>
        <div class="p-2">
          {#if chatHistoryList.length === 0}
            <div class="p-4 text-center text-sm opacity-70">
              暂无对话历史
            </div>
          {:else}
            {#each chatHistoryList.reverse() as chat}
              <div 
                onclick={() => loadChat(chat)}
                class="p-3 mb-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 relative"
              >
                <div class="flex justify-between items-start">
                  <h4 class="font-medium text-sm truncate">{chat.title}</h4>
                  <button 
                    onclick={(e) => handleDeleteChat(chat.id, e)}
                    class="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>
                <p class="text-xs opacity-70 mt-1 truncate">
                  {chat.messages.length > 0 ? chat.messages[0].content.substring(0, 50) + '...' : '无消息'}
                </p>
                <p class="text-xs opacity-50 mt-1">
                  {new Date(chat.updatedAt).toLocaleString()}
                </p>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    {/if}

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
                <p class="text-xs opacity-50 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
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
