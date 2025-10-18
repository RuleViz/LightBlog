import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Typography, Space } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async (values: { password: string }) => {
    setLoading(true);
    try {
      // 发送密码验证请求到后端
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: values.password }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 200) {
          message.success('验证成功！');
          localStorage.setItem('adminAuthenticated', 'true');
          onLogin();
        } else {
          message.error(result.message || '密码错误，请重试');
        }
      } else {
        message.error('网络错误，请重试');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              RuleViz 管理
            </Title>
            <Text type="secondary">请输入管理密码以访问后台</Text>
          </div>

          <Form
            form={form}
            name="adminLogin"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入管理密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="管理密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ width: '100%' }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => navigate('/')}>
              返回首页
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default AdminLogin;
