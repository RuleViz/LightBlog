import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Breadcrumb, Empty, Button, Tag } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchTagBySlug } from '@/store/slices/tagsSlice';
import PostList from '@/components/user/PostList';
import Loading from '@/components/common/Loading';

const { Title, Paragraph } = Typography;

const TagPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentTag, loading: tagLoading } = useSelector((state: RootState) => state.tags);

  useEffect(() => {
    if (slug) {
      dispatch(fetchTagBySlug(slug));
    }
  }, [dispatch, slug]);


  if (tagLoading) {
    return <Loading />;
  }

  if (!currentTag) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <Empty 
          description="标签不存在"
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
        <Breadcrumb.Item>标签</Breadcrumb.Item>
        <Breadcrumb.Item>{currentTag.name}</Breadcrumb.Item>
      </Breadcrumb>

      <div className="page-header-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <Tag 
            color={currentTag.color || 'blue'} 
            style={{ fontSize: '24px', padding: '10px 20px', margin: 0 }}
          >
            {currentTag.name}
          </Tag>
          <Paragraph className="page-description" style={{ margin: 0 }}>
            共 {currentTag.postCount} 篇文章
          </Paragraph>
        </div>
      </div>

      <PostList searchParams={{ tagId: currentTag.id }} />
    </div>
  );
};

export default TagPage;
