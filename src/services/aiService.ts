import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Survey, Schema, Section, Field, SystemSettings } from '../types';

// 从系统设置获取配置
const getSystemSettings = (): SystemSettings => {
  try {
    const data = localStorage.getItem('insightflow_settings');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// 从系统设置获取 AI 提供商
const getAiProvider = (): string => {
  const settings = getSystemSettings();
  return settings?.aiProvider || 'gemini';
};

// 从系统设置获取 API 密钥
const getApiKey = (): string => {
  const settings = getSystemSettings();
  const provider = getAiProvider();
  
  if (provider === 'minimax' && settings?.minimaxApiKey) {
    return settings.minimaxApiKey;
  }
  
  if (provider === 'gemini' && settings?.geminiApiKey) {
    return settings.geminiApiKey;
  }
  
  // 优先从环境变量获取
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  
  // 默认密钥（仅用于开发环境）
  return 'AIzaSyDe2Cn9Xw0XW18m0vD6Zx0QvZ7N6yQ7vQ';
};

// 从系统设置获取 Minimax Group ID
const getMinimaxGroupId = (): string => {
  const settings = getSystemSettings();
  return settings?.minimaxGroupId || '';
};

// 从系统设置获取 AI 模型
const getAiModel = (): string => {
  const settings = getSystemSettings();
  const provider = getAiProvider();
  
  if (provider === 'minimax' && settings?.aiModel) {
    return settings.aiModel;
  }
  
  return settings?.aiModel || 'gemini-1.5-flash';
};

// 从系统设置获取 AI 温度
const getAiTemperature = (): number => {
  const settings = getSystemSettings();
  return settings?.aiTemperature || 0.7;
};

// 初始化 Gemini AI
const initGeminiAI = () => {
  const apiKey = getApiKey();
  const modelName = getAiModel();
  const temperature = getAiTemperature();
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature
    }
  });
  
  return model;
};

// 调用 Minimax API
const callMinimaxAPI = async (prompt: string): Promise<string> => {
  console.log('callMinimaxAPI called');
  const apiKey = getApiKey();
  const groupId = getMinimaxGroupId();
  const modelName = getAiModel();
  const temperature = getAiTemperature();
  
  console.log('Minimax API config:', {
    apiKey: apiKey ? '***' : 'not set',
    groupId: groupId ? '***' : 'not set',
    modelName,
    temperature
  });
  
  if (!apiKey || !groupId) {
    throw new Error('Minimax API key or Group ID is not configured');
  }
  
  console.log('Sending request to Minimax API');
  const response = await fetch('https://api.minimaxi.com/v1/text/chatcompletion_v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: 'system',
          name: 'MiniMax AI'
        },
        {
          role: 'user',
          content: prompt,
          name: '用户'
        }
      ]
    })
  });
  
  console.log('Minimax API response status:', response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Minimax API error response:', errorText);
    throw new Error(`Minimax API error: ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Minimax API response data:', data);
  
  // 处理不同的响应格式
  if (data.reply) {
    return data.reply;
  } else if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  } else {
    throw new Error('Invalid Minimax API response format');
  }
};

// 生成问卷的提示模板
const surveyPromptTemplate = `
你是一个专业的问卷设计专家，请根据用户的需求生成一份完整的问卷。

用户需求: ${"{{userInput}}"}

请按照以下 JSON 格式输出问卷数据，确保格式正确：

{
  "title": "问卷标题",
  "description": "问卷描述",
  "sections": [
    {
      "title": "章节标题",
      "fields": [
        {
          "type": "input", // 支持的类型：input, textarea, select, radio, checkbox, date, number, rating, email, tel, url, image
          "label": "问题标签",
          "required": true, // 是否必填
          "logic": ""
        }
      ]
    }
  ]
}

请确保：
1. 生成至少 2 个章节，每个章节至少 2 个问题
2. 合理设置问题类型和必填项
3. 问卷内容符合用户需求
4. 输出格式必须是有效的 JSON
`;

// 生成问卷
export const generateSurveyFromAI = async (userInput: string): Promise<Survey> => {
  console.log('generateSurveyFromAI called with input:', userInput);
  try {
    const provider = getAiProvider();
    console.log('Using AI provider:', provider);
    let text = '';
    
    // 构建提示
    const prompt = surveyPromptTemplate.replace('{{userInput}}', userInput);
    console.log('Generated prompt:', prompt);
    
    // 根据提供商调用相应的 API
    if (provider === 'minimax') {
      // 调用 Minimax API
      console.log('Calling Minimax API');
      text = await callMinimaxAPI(prompt);
    } else {
      // 调用 Gemini API
      console.log('Calling Gemini API');
      const model = initGeminiAI();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    }
    
    console.log('API response text:', text);
    
    // 提取 JSON 部分
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 生成的响应格式不正确');
    }
    
    const surveyData = JSON.parse(jsonMatch[0]);
    console.log('Parsed survey data:', surveyData);
    
    // 转换为系统可用的问卷格式
    const sections: Section[] = surveyData.sections.map((section: any, index: number) => ({
      id: `sec_${Date.now()}_${index}`,
      title: section.title,
      fields: section.fields.map((field: any, fieldIndex: number) => ({
        id: `fld_${Date.now()}_${index}_${fieldIndex}`,
        type: field.type,
        label: field.label,
        required: field.required,
        logic: field.logic || ''
      }))
    }));
    
    const survey = {
      id: `s_${Date.now()}`,
      title: surveyData.title,
      description: surveyData.description,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      responsesCount: 0,
      schema: {
        sections
      },
      version: 1,
      theme: {
        primaryColor: '#2563eb',
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        buttonTextColor: '#ffffff'
      }
    };
    
    console.log('Final survey object:', survey);
    return survey;
  } catch (error) {
    console.error('AI 生成问卷失败:', error);
    // 生成失败时返回默认问卷
    return generateDefaultSurvey(userInput);
  }
};

// 生成默认问卷（当 AI 生成失败时使用）
const generateDefaultSurvey = (userInput: string): Survey => {
  const sections: Section[] = [
    {
      id: 'sec_1',
      title: '基本信息',
      fields: [
        {
          id: 'fld_name',
          type: 'input',
          label: '您的姓名',
          required: true,
          logic: ''
        },
        {
          id: 'fld_email',
          type: 'email',
          label: '您的邮箱',
          required: true,
          logic: ''
        }
      ]
    },
    {
      id: 'sec_2',
      title: '主要问题',
      fields: [
        {
          id: 'fld_q1',
          type: 'rating',
          label: '您对我们的服务满意度如何？',
          required: true,
          logic: ''
        },
        {
          id: 'fld_q2',
          type: 'radio',
          label: '您是通过什么渠道了解我们的？',
          required: true,
          logic: ''
        },
        {
          id: 'fld_q3',
          type: 'textarea',
          label: '您有什么建议或意见？',
          required: false,
          logic: ''
        }
      ]
    }
  ];

  return {
    id: `s_${Date.now()}`,
    title: userInput.includes('满意度') ? '用户满意度调查' : '问卷调查',
    description: '通过 AI 生成的问卷',
    status: 'draft',
    createdAt: new Date().toISOString().split('T')[0],
    responsesCount: 0,
    schema: {
      sections
    },
    version: 1,
    theme: {
      primaryColor: '#2563eb',
      backgroundColor: '#ffffff',
      textColor: '#1e293b',
      buttonTextColor: '#ffffff'
    }
  };
};

// 保存 API 密钥
export const saveApiKey = (key: string): void => {
  localStorage.setItem('gemini_api_key', key);
};

// 获取 API 密钥
export const getSavedApiKey = (): string | null => {
  return localStorage.getItem('gemini_api_key');
};
