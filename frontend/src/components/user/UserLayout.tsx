import React, { useEffect } from 'react';
import { Layout, Input, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchAllCategories } from '@/store/slices/categoriesSlice';
import ThemeToggle from '@/components/common/ThemeToggle';

const { Header, Content, Footer } = Layout;
const { Search } = Input;

const UserLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { allCategories } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isCategoryActive = location.pathname.startsWith('/categories');

  const topCategories = allCategories.slice(0, 6);

  const dropdownItems: MenuProps['items'] = [
    ...topCategories.map(category => ({
      key: category.slug,
      label: category.name,
    })),
    {
      type: 'divider',
    },
    {
      key: 'all',
      label: '全部',
    },
  ];

  const handleCategoryMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'all') {
      navigate('/categories');
      return;
    }

    navigate(`/categories/${key}`);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--background-color)', overflow: 'visible' }}>
      <Header className="modern-header" style={{ overflow: 'visible' }}>
        <div className="header-content">
          <div className="header-left">
            <div className="logo-simple" onClick={() => navigate('/')}>
              RuleViz
            </div>
            
            <nav className="nav-menu">
              <div 
                className={`nav-item ${isActive('/') ? 'active' : ''}`}
                onClick={() => navigate('/')}
              >
                首页
              </div>
              
              <Dropdown
                menu={{ items: dropdownItems, onClick: handleCategoryMenuClick }}
                trigger={['hover']}
                overlayClassName="nav-dropdown-menu"
                placement="bottom"
              >
                <div className={`nav-item ${isCategoryActive ? 'active' : ''}`}>
                  分类
                </div>
              </Dropdown>
            </nav>
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
    </Layout>
  );
};

export default UserLayout;
