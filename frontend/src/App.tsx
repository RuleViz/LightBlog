import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { ConfigProvider, theme, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store, RootState } from '@/store';
import { setTheme } from '@/store/slices/uiSlice';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// 布局组件直接导入（因为是核心组件）
import UserLayout from '@/components/user/UserLayout';
import AdminLayout from '@/components/admin/AdminLayout';

// 用户端页面懒加载
const Home = lazy(() => import('@/pages/Home'));
const PostDetail = lazy(() => import('@/components/user/PostDetail'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const TagPage = lazy(() => import('@/pages/TagPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));

// 管理端页面懒加载
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const PostList = lazy(() => import('@/components/admin/PostList'));
const PostForm = lazy(() => import('@/components/admin/PostForm'));
const CategoryList = lazy(() => import('@/components/admin/CategoryList'));
const TagList = lazy(() => import('@/components/admin/TagList'));

// 加载中组件
const PageLoader: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '60vh' 
  }}>
    <Spin size="large">
      <div style={{ padding: '50px' }} />
    </Spin>
  </div>
);

// 内部应用组件，用于访问 Redux 状态
const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const { theme: currentTheme } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    // 从本地存储恢复主题设置
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme && savedTheme !== currentTheme) {
      dispatch(setTheme(savedTheme));
    }
  }, [dispatch, currentTheme]);

  useEffect(() => {
    // 更新 HTML 根元素的 data-theme 属性
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const antdTheme = {
    algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
  };

  return (
    <ConfigProvider locale={zhCN} theme={antdTheme}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* 用户端路由 */}
            <Route path="/" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="posts/:slug" element={<PostDetail />} />
              <Route path="categories/:slug" element={<CategoryPage />} />
              <Route path="tags/:slug" element={<TagPage />} />
              <Route path="search" element={<SearchPage />} />
            </Route>

            {/* 管理端路由 */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="posts" element={<PostList />} />
              <Route path="posts/new" element={<PostForm />} />
              <Route path="posts/:id" element={<PostDetail />} />
              <Route path="posts/:id/edit" element={<PostForm />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="tags" element={<TagList />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
