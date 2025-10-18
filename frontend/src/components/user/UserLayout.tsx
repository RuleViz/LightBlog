import React, { useState } from 'react';
import { Layout, Menu, Button, Input, Drawer } from 'antd';
import { MenuOutlined, SearchOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import ThemeToggle from '@/components/common/ThemeToggle';

const { Header, Content, Footer } = Layout;
const { Search } = Input;

const UserLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { allCategories } = useSelector((state: RootState) => state.categories);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const menuItems = [
    {
      key: '/',
      label: '首页',
    },
    {
      key: '/categories',
      label: '分类',
      children: allCategories.map(category => ({
        key: `/categories/${category.slug}`,
        label: category.name,
      })),
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    setDrawerVisible(false);
  };

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--background-color)' }}>
      <Header className="modern-header">
        <div className="header-content">
          <div className="header-left">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              className="menu-button"
            />
            <div className="logo-simple" onClick={() => navigate('/')}>
              RuleViz
            </div>
          </div>

          <div className="header-right">
            <Search
              placeholder="搜索文章..."
              onSearch={handleSearch}
              className="search-input"
              enterButton={<SearchOutlined />}
              size="large"
            />
            <ThemeToggle />
          </div>
        </div>
      </Header>

      <Content style={{ marginTop: '72px', padding: '0', minHeight: 'calc(100vh - 72px - 200px)' }}>
        <Outlet />
      </Content>

      <Footer className="modern-footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-section">
              <h3 className="footer-title">RuleViz</h3>
              <p className="footer-description">
                分享技术心得、前沿AI技术
              </p>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-subtitle">快速链接</h4>
              <ul className="footer-links">
                <li><a onClick={() => navigate('/')}>首页</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-subtitle">关注我</h4>
              <ul className="footer-links">
                <li><a href="https://github.com/mimsq" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                <li><a href="mailto:zalaohuang66@163.com">邮箱</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2025 RuleViz. All rights reserved.</p>
          </div>
        </div>
      </Footer>

      <Drawer
        title="导航菜单"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Drawer>
    </Layout>
  );
};

export default UserLayout;
