import axios, { AxiosInstance } from 'axios';

// AI服务相关类型定义 - 匹配后端期望格式
export interface AISummaryRequest {
  content: string;
  lengthHint?: number;
}

export interface AIPolishRequest {
  content: string;
  tone?: string;
  style?: string;
}

export interface AIResponse {
  result: string;
  success: boolean;
  message?: string;
}

// AI服务API类
class AIService {
  private api: AxiosInstance;

  constructor(apiInstance?: AxiosInstance) {
    this.api = apiInstance ?? axios.create({
      baseURL: '/ai',
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private toAIResponse(data: any): AIResponse {
    if (data && typeof data === 'object') {
      if (Object.prototype.hasOwnProperty.call(data, 'result')) {
        return {
          result: data.result ?? '',
          success: data.success ?? true,
          message: data.message,
        };
      }
      // 兼容后端统一响应结构 { success, data, message }
      if (Object.prototype.hasOwnProperty.call(data, 'data')) {
        return {
          result: data.data ?? '',
          success: data.success ?? true,
          message: data.message,
        };
      }
    }
    return { result: data ? String(data) : '', success: true };
  }

  // 总结摘要 - 使用非流式接口
  async generateSummary(request: AISummaryRequest): Promise<AIResponse> {
    try {
      const response = await this.api.post('/summarize', request);
      return this.toAIResponse(response.data);
    } catch (error) {
      console.error('AI总结请求失败:', error);
      return {
        result: '',
        success: false,
        message: 'AI总结服务暂时不可用，请稍后重试'
      };
    }
  }

  // 内容润色 - 使用非流式接口
  async polishContent(request: AIPolishRequest): Promise<AIResponse> {
    try {
      const response = await this.api.post('/polish', request);
      return this.toAIResponse(response.data);
    } catch (error) {
      console.error('AI润色请求失败:', error);
      return {
        result: '',
        success: false,
        message: 'AI润色服务暂时不可用，请稍后重试'
      };
    }
  }

  // 流式响应处理 - 使用Server-Sent Events
  async streamAIResponse(endpoint: string, request: any, onChunk: (chunk: string) => void): Promise<void> {
    try {
      const path = (() => {
        if (endpoint.startsWith('http')) return endpoint;
        if (endpoint.startsWith('/ai')) return endpoint;
        if (endpoint.startsWith('/')) return `/ai${endpoint}`;
        return `/ai/${endpoint}`;
      })();

      const response = await fetch(path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (reader) {
        let buffer = '';

        const processEventBlock = (block: string) => {
          // 一个事件块由多行组成，以空行分隔
          // 典型：
          // event: message\n
          // data: xxx\n
          // \n
          let eventType: string | null = null;
          const dataLines: string[] = [];
          const lines = block.split(/\r?\n/);
          for (const raw of lines) {
            const line = raw.trimEnd();
            if (!line) continue;
            if (line.startsWith('event:')) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              // 兼容 `data:` 与 `data: ` 两种格式
              const val = line.slice(5).trimStart();
              dataLines.push(val);
            }
          }
          const data = dataLines.join('\n');
          if (!data) return;
          if (eventType === 'error') {
            console.error('SSE错误事件:', data);
            throw new Error(data);
          }
          onChunk(data);
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // 事件以空行分隔（\n\n 或 \r\n\r\n）
          let boundaryIndex: number;
          // 持续查找并处理完整事件块
          while ((boundaryIndex = buffer.search(/\r?\n\r?\n/)) !== -1) {
            const block = buffer.slice(0, boundaryIndex);
            buffer = buffer.slice(boundaryIndex).replace(/^\r?\n/, '');
            if (block.trim().length > 0) {
              processEventBlock(block);
            }
          }
        }

        // 处理可能遗留的最后一块
        if (buffer.trim().length > 0) {
          processEventBlock(buffer);
        }
      }
    } catch (error) {
      console.error('流式响应失败:', error);
      throw error;
    }
  }
}

export default AIService;