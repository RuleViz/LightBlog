import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
  Typography,
  Spin,
  Divider,
  Row,
  Col,
  Card
} from 'antd';
import {
  SendOutlined,
  CopyOutlined,
  RobotOutlined,
  BulbOutlined,
  EditOutlined
} from '@ant-design/icons';
import AIService, { AISummaryRequest, AIPolishRequest } from '@/services/ai';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

export interface AIDialogProps {
  visible: boolean;
  onClose: () => void;
  content: string;
  onResult: (result: string) => void;
  aiService: AIService;
}

const AIDialog: React.FC<AIDialogProps> = ({
  visible,
  onClose,
  content: initialContent,
  onResult,
  aiService
}) => {
  const [form] = Form.useForm();
  const [mode, setMode] = useState<'summary' | 'polish'>('summary');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // 处理模式切换
  const handleModeChange = (newMode: 'summary' | 'polish') => {
    setMode(newMode);
    form.resetFields();
    setResult('');
    setInputText('');
  };

  // 处理AI请求（改为SSE流式）
  const handleAIRequest = async () => {
    if (!inputText.trim()) {
      message.warning('请输入要处理的内容');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      if (mode === 'summary') {
        // 总结模式
        const request: AISummaryRequest = {
          content: inputText,
          lengthHint: form.getFieldValue('maxLength') || 200
        };

        // 使用SSE流式响应
        await aiService.streamAIResponse('/summarize/stream', request, (chunk) => {
          setResult(prev => prev + chunk);
        });
        message.success('AI处理完成');
      } else {
        // 润色模式
        const request: AIPolishRequest = {
          content: inputText,
          tone: form.getFieldValue('tone') || 'neutral',
        };

        // 使用SSE流式响应
        await aiService.streamAIResponse('/polish/stream', request, (chunk) => {
          setResult(prev => prev + chunk);
        });
        message.success('AI处理完成');
      }
    } catch (error) {
      console.error('AI请求失败:', error);
      message.error('AI服务暂时不可用，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 复制结果
  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result).then(() => {
        message.success('结果已复制到剪贴板');
      }).catch(() => {
        message.error('复制失败');
      });
    }
  };

  // 应用结果到编辑器
  const handleApply = () => {
    if (result) {
      onResult(result);
      message.success('结果已应用到编辑器');
      onClose();
    }
  };

  // 重置表单
  const handleReset = () => {
    form.resetFields();
    setResult('');
    setInputText('');
  };

  // 模态框关闭时重置状态
  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  // 使用传入的content作为初始值
  useEffect(() => {
    if (initialContent && visible) {
      setInputText(initialContent);
    }
  }, [initialContent, visible]);

  return (
    <Modal
      title={
        <Space>
          <RobotOutlined />
          AI助手
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {mode === 'summary' ? '智能总结' : '内容润色'}
          </Text>
        </Space>
      }
      open={visible}
      onCancel={handleModalClose}
      footer={null}
      width={800}
      styles={{
        body: { padding: '20px', maxHeight: '70vh', overflowY: 'auto' }
      }}
    >
      <Row gutter={[16, 16]}>
        {/* 左侧：输入区域 */}
        <Col span={12}>
          <Card size="small" title="输入内容">
            <Form form={form} layout="vertical">
              {/* 模式选择 */}
              <Form.Item label="AI模式">
                <Select
                  value={mode}
                  onChange={handleModeChange}
                  style={{ width: '100%' }}
                >
                  <Option value="summary">
                    <Space>
                      <BulbOutlined />
                      总结摘要
                    </Space>
                  </Option>
                  <Option value="polish">
                    <Space>
                      <EditOutlined />
                      内容润色
                    </Space>
                  </Option>
                </Select>
              </Form.Item>

              {/* 动态配置选项 */}
              {mode === 'summary' && (
                <Form.Item
                  name="maxLength"
                  label="最大长度"
                  initialValue={200}
                >
                  <Select>
                    <Option value={100}>100字</Option>
                    <Option value={200}>200字</Option>
                    <Option value={300}>300字</Option>
                    <Option value={500}>500字</Option>
                  </Select>
                </Form.Item>
              )}

              {mode === 'polish' && (
                <>
                  <Form.Item
                    name="style"
                    label="写作风格"
                    initialValue="professional"
                  >
                    <Select>
                      <Option value="professional">专业正式</Option>
                      <Option value="casual">轻松随意</Option>
                      <Option value="academic">学术严谨</Option>
                      <Option value="creative">创意生动</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="tone"
                    label="语气"
                    initialValue="neutral"
                  >
                    <Select>
                      <Option value="neutral">中性</Option>
                      <Option value="friendly">友好</Option>
                      <Option value="formal">正式</Option>
                      <Option value="enthusiastic">热情</Option>
                    </Select>
                  </Form.Item>
                </>
              )}

              {/* 输入文本 */}
              <Form.Item label="文本内容">
                <TextArea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={mode === 'summary'
                    ? '请输入需要总结的内容...'
                    : '请输入需要润色的内容...'
                  }
                  rows={8}
                  showCount
                  maxLength={mode === 'summary' ? 2000 : 1000}
                />
              </Form.Item>

              {/* 操作按钮 */}
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleAIRequest}
                    loading={loading}
                    disabled={!inputText.trim()}
                  >
                    {loading ? '处理中...' : '发送'}
                  </Button>
                  <Button onClick={handleReset}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 右侧：结果区域 */}
        <Col span={12}>
          <Card
            size="small"
            title="处理结果"
            extra={
              result && (
                <Space>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={handleCopy}
                  >
                    复制
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    onClick={handleApply}
                  >
                    应用
                  </Button>
                </Space>
              )
            }
          >
            {loading ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 0',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>
                  <Text type="secondary">
                    AI正在处理中，请稍候...
                  </Text>
                </div>
              </div>
            ) : result ? (
              <div
                style={{
                  minHeight: '200px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {result}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 0',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text type="secondary">
                  {mode === 'summary'
                    ? '输入内容后，AI将为您生成简洁的摘要'
                    : '输入内容后，AI将为您优化文本表达'
                  }
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: '16px 0' }} />

      {/* 使用提示 */}
      <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          💡 使用提示：{mode === 'summary'
            ? '总结模式适合提炼长文章的核心观点，建议输入500字以上的内容以获得更好的效果。'
            : '润色模式可以改善文本的表达方式和语言风格，支持多种写作风格和语气选择。'
          }
        </Text>
      </div>
    </Modal>
  );
};

export default AIDialog;