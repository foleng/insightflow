<script lang="ts">

  import { MessageSquare, Send, Loader2, Edit, Trash2, Bot, Plus, Clock, Sparkles, FileText, LogOut } from 'lucide-svelte';
  import type { Survey, Schema, Section, Field, ChatHistory, Message } from '../types';
  import { t } from '../i18n';
  import { generateSurveyFromAI, saveChatHistory, loadChatHistoryList, createNewChat, deleteChatHistory } from '../services/aiService';

  // Props
  const { onGenerate, onBack } = $props<{
    onGenerate: (survey: Survey) => void;
    onBack: () => void;
  }>();

  // State
  let message = $state('');
  let chatHistoryList = $state<ChatHistory[]>(loadChatHistoryList());
  let currentChat = $state<ChatHistory>(createNewChat());
  let isLoading = $state(false);

  console.log('AIChatView mounted', isLoading, message);
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

<style>
  :root {
    --primary-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    --glass-bg: rgba(255, 255, 255, 0.7);
    --border-color: rgba(255, 255, 255, 0.3);
    --text-main: #1e293b;
    --text-sub: #64748b;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    100% { transform: scale(1.1); }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .bg-glow {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    background: 
      radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 40%);
    filter: blur(80px);
    animation: pulse 10s infinite alternate;
  }

  .container {
    width: 100%;
    height: 100%;
    min-height: 100vh;
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-color);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
    display: flex;
    overflow: hidden;
  }

  .main-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .header {
    padding: 24px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo-area h2 {
    font-size: 1.5rem;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 800;
  }

  .nav-links {
    display: flex;
    align-items: center;
  }

  .nav-links button {
    background: transparent;
    border: none;
    color: var(--text-sub);
    margin-left: 20px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nav-links button:hover {
    color: #6366f1;
  }

  .chat-content {
    flex: 1;
    padding: 20px 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .welcome-card {
    max-width: 500px;
    animation: fadeInUp 0.8s ease-out;
  }

  .ai-icon {
    width: 80px;
    height: 80px;
    background: var(--primary-gradient);
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
    color: white;
    font-size: 2rem;
  }

  .welcome-card h1 {
    color: var(--text-main);
    margin-bottom: 12px;
    font-size: 2rem;
  }

  .welcome-card p {
    color: var(--text-sub);
    line-height: 1.6;
  }

  .input-area {
    padding: 40px 80px;
  }

  .input-wrapper {
    background: white;
    border-radius: 20px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    border: 2px solid transparent;
    transition: 0.3s;
  }

  .input-wrapper:focus-within {
    border-color: #6366f1;
    box-shadow: 0 10px 40px rgba(99, 102, 241, 0.15);
  }

  .input-wrapper input {
    flex: 1;
    border: none;
    outline: none;
    padding: 12px;
    font-size: 1rem;
    color: var(--text-main);
  }

  .send-btn {
    width: 45px;
    height: 45px;
    border-radius: 12px;
    background: var(--primary-gradient);
    border: none;
    color: white;
    cursor: pointer;
    transition: 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .send-btn:hover {
    transform: scale(1.05) translateY(-2px);
    box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4);
  }

  .preview-panel {
    width: 350px;
    background: rgba(255, 255, 255, 0.4);
    display: flex;
    flex-direction: column;
    border-left: 1px solid rgba(0, 0, 0, 0.05);
  }

  .preview-header {
    padding: 30px;
    font-weight: 700;
    color: var(--text-main);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .preview-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: var(--text-sub);
    padding: 40px;
    text-align: center;
  }

  .preview-empty i {
    font-size: 3rem;
    margin-bottom: 20px;
    opacity: 0.2;
  }

  .chat-messages {
    flex: 1;
    padding: 40px 60px;
    overflow-y: auto;
  }

  .chat-message {
    margin-bottom: 20px;
    animation: fadeInUp 0.5s ease;
  }

  .user-message {
    text-align: right;
  }

  .assistant-message {
    text-align: left;
  }

  .message-content {
    display: inline-block;
    padding: 15px 20px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  }

  .user-message .message-content {
    background: white;
  }

  .assistant-message .message-content {
    background: white;
  }

  .message-time {
    font-size: 0.75rem;
    color: var(--text-sub);
    margin-top: 5px;
  }

  .loading-message {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #6366f1;
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    padding: 15px 20px;
    border-radius: 15px;
    margin-bottom: 20px;
  }

  .suggestions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .suggestion-tag {
    font-size: 0.75rem;
    color: var(--text-sub);
    background: rgba(0,0,0,0.05);
    padding: 4px 12px;
    border-radius: 20px;
    cursor: pointer;
    transition: 0.3s;
  }

  .suggestion-tag:hover {
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
  }

  .survey-preview {
    padding: 30px;
    overflow-y: auto;
    flex: 1;
  }

  .survey-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 10px;
  }

  .survey-description {
    color: var(--text-sub);
    margin-bottom: 20px;
  }

  .survey-section {
    margin-bottom: 20px;
  }

  .section-title {
    font-weight: 600;
    margin-bottom: 10px;
  }

  .section-fields {
    margin-left: 20px;
    border-left: 1px solid rgba(0, 0, 0, 0.1);
    padding-left: 15px;
  }

  .field-item {
    margin-bottom: 8px;
    font-size: 0.9rem;
  }

  .edit-btn {
    width: 100%;
    margin-top: 30px;
    padding: 12px;
    border: none;
    border-radius: 12px;
    background: var(--primary-gradient);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .edit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
  }
</style>

<div class="bg-glow"></div>

<div class="container">
  <!-- 主对话区域 -->
  <main class="main-chat">
    <header class="header">
      <div class="logo-area">
        <h2>AI Questionnaire <span style="font-weight: 300;">Architect</span></h2>
      </div>
      <nav class="nav-links">
        <button onclick={() => showHistory = !showHistory}>
          <Clock class="w-4 h-4" />
          历史记录
        </button>
        <button onclick={startNewChat}>
          <Plus class="w-4 h-4" />
          新对话
        </button>
        <button style="color: #ef4444;" onclick={onBack}>
          <LogOut class="w-4 h-4" />
          退出
        </button>
      </nav>
    </header>

    {#if messages.length === 0}
      <div class="chat-content">
        <div class="welcome-card">
          <div class="ai-icon">
            <Sparkles class="w-10 h-10" />
          </div>
          <h1>构建您的专业问卷</h1>
          <p>描述您的需求（例如：类型、主题、受众），我将实时为您生成结构完整、逻辑严密的问卷草案。</p>
        </div>
      </div>
    {:else}
      <div class="chat-messages">
        {#each messages as msg, index}
          <div class={`chat-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}>
            <div class="message-content">
              <p>{msg.content}</p>
              <p class="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        {/each}
        
        {#if isLoading}
          <div class="chat-message assistant-message">
            <div class="message-content">
              <div class="loading-message">
                <Loader2 class="w-4 h-4 animate-spin" />
                <span>正在深度思考并构建问卷结构...</span>
              </div>
            </div>
          </div>
        {/if}
        
        {#if error}
          <div class="error-message">
            <p>{error}</p>
          </div>
        {/if}
      </div>
    {/if}

    <div class="input-area">
      <div class="input-wrapper">
        <Sparkles class="w-5 h-5" style="color: #6366f1; margin-right: 10px;" />
        <input 
          type="text" 
          bind:value={message}
          placeholder="例如：创建一个关于远程办公效率的满意度调研，包含10个问题..."
          onkeypress={(e) => e.key === 'Enter' && generateSurvey()}
        />
        <button class="send-btn" onclick={generateSurvey} disabled={!message.trim() || isLoading}>
          {#if isLoading}
            <Loader2 class="w-5 h-5 animate-spin" />
          {:else}
            <Send class="w-5 h-5" />
          {/if}
        </button>
      </div>
      <div class="suggestions">
        <span class="suggestion-tag" onclick={() => message = '满意度调查'}>满意度调查</span>
        <span class="suggestion-tag" onclick={() => message = '学术研究'}>学术研究</span>
        <span class="suggestion-tag" onclick={() => message = '产品反馈'}>产品反馈</span>
      </div>
    </div>
  </main>

  <!-- 右侧预览面板 -->
  <aside class="preview-panel">
    <div class="preview-header">
      <Sparkles class="w-5 h-5" style="color: #a855f7;" />
      AI 实时生成预览
    </div>
    {#if hasGeneratedSurvey && generatedSurvey}
      <div class="survey-preview">
        <h3 class="survey-title">{generatedSurvey.title}</h3>
        <p class="survey-description">{generatedSurvey.description}</p>
        
        <div class="survey-sections">
          {#each generatedSurvey.schema.sections as section}
            <div class="survey-section">
              <h4 class="section-title">{section.title}</h4>
              <div class="section-fields">
                {#each section.fields as field}
                  <div class="field-item">
                    {field.label} {field.required ? '*' : ''}
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
        
        <button class="edit-btn" onclick={editSurvey}>
          <Edit class="w-4 h-4" />
          编辑生成的问卷
        </button>
      </div>
    {:else}
      <div class="preview-empty">
        <FileText class="w-16 h-16" />
        <p>在左侧输入您的需求<br><span style="font-size: 0.8rem; opacity: 0.7;">问卷内容将在这里实时呈现</span></p>
      </div>
    {/if}
  </aside>
</div>
