import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Empty } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchPosts } from '@/store/slices/postsSlice';
import PostList from '@/components/user/PostList';
import Loading from '@/components/common/Loading';

const { Title, Paragraph } = Typography;

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading } = useSelector((state: RootState) => state.posts);

  const [query, setQuery] = useState('');
  const [searchFormParams, setSearchFormParams] = useState({
    page: 0,
    size: 10,
    keyword: '',
  });

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      setSearchFormParams(prev => ({
        ...prev,
        keyword: q,
      }));
    } else {
      // 如果没有查询参数，清空状态
      setQuery('');
      setSearchFormParams(prev => ({
        ...prev,
        keyword: '',
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    dispatch(fetchPosts(searchFormParams));
  }, [dispatch, searchFormParams]);

  return (
    <div className="page-container">
      {query ? (
        <>
          <div className="page-header-section">
            <Title level={2} className="page-title">搜索结果</Title>
            <Paragraph className="page-description">
              关键词: <strong>"{query}"</strong> | 共找到 {posts.length} 篇文章
            </Paragraph>
          </div>

          <Loading spinning={loading}>
            {posts.length > 0 ? (
              <PostList searchParams={searchFormParams} />
            ) : (
              <Empty 
                description="没有找到相关文章"
                style={{ margin: '50px 0' }}
              >
                <Button type="primary" onClick={() => navigate('/')}>
                  返回首页
                </Button>
              </Empty>
            )}
          </Loading>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Title level={2} className="page-title">搜索文章</Title>
          <Paragraph className="page-description" style={{ marginBottom: '32px' }}>
            请使用右上角的搜索框输入关键词来搜索文章
          </Paragraph>
          <Button type="primary" size="large" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
