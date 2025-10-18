import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, message } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  FileTextOutlined,
  TagsOutlined,
  FolderOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { toggleSidebar } from '@/store/slices/uiSlice';
import AdminLogin from './AdminLogin';
import ThemeToggle from '@/components/common/ThemeToggle';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { sidebarCollapsed, theme: currentTheme } = useSelector((state: RootState) => state.ui);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/admin/posts',
      icon: <FileTextOutlined />,
      label: '文章管理',
    },
    {
      key: '/admin/categories',
      icon: <FolderOutlined />,
      label: '分类管理',
    },
    {
      key: '/admin/tags',
      icon: <TagsOutlined />,
      label: '标签管理',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  useEffect(() => {
    // 检查是否已经认证
    const authenticated = localStorage.getItem('adminAuthenticated');
    setIsAuthenticated(authenticated === 'true');
  }, []);

  const toggleCollapsed = () => {
    dispatch(toggleSidebar());
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
    message.success('已退出登录');
  };

  // 如果未认证，显示登录页面
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={sidebarCollapsed}
        theme={currentTheme === 'dark' ? 'dark' : 'light'}
      >
        <div style={{ 
          height: '32px', 
          margin: '16px', 
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold'
        }}>
          {sidebarCollapsed ? 'RuleViz' : 'RuleViz 管理'}
        </div>
        <Menu
          theme={currentTheme === 'dark' ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: 0, 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingRight: '24px'
        }}>
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThemeToggle />
            <Button type="link" onClick={() => navigate('/')}>
              返回前台
            </Button>
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
              退出
            </Button>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
