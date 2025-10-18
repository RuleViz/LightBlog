import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Breadcrumb, Empty, Button } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchCategoryBySlug } from '@/store/slices/categoriesSlice';
import PostList from '@/components/user/PostList';
import Loading from '@/components/common/Loading';

const { Title, Paragraph } = Typography;

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentCategory, loading: categoryLoading } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    if (slug) {
      dispatch(fetchCategoryBySlug(slug));
    }
  }, [dispatch, slug]);


  if (categoryLoading) {
    return <Loading />;
  }

  if (!currentCategory) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <Empty 
          description="分类不存在"
          style={{ margin: '50px 0' }}
        >
          <Button type="primary" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <Breadcrumb.Item>
          <HomeOutlined />
          <a onClick={() => navigate('/')}>首页</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>分类</Breadcrumb.Item>
        <Breadcrumb.Item>{currentCategory.name}</Breadcrumb.Item>
      </Breadcrumb>

      <div className="page-header-section">
        <Title level={2} className="page-title">{currentCategory.name}</Title>
        {currentCategory.description && (
          <Paragraph className="page-description">
            {currentCategory.description}
          </Paragraph>
        )}
      </div>

      <PostList searchParams={{ categoryId: currentCategory.id }} />
    </div>
  );
};

export default CategoryPage;
