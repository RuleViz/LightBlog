import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, List, Tag } from 'antd';
import { FileTextOutlined, FolderOutlined, TagsOutlined, EyeOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchAdminPosts } from '@/store/slices/postsSlice';
import { fetchAllCategories } from '@/store/slices/categoriesSlice';
import { fetchAllTags } from '@/store/slices/tagsSlice';
import { apiService } from '@/services/api';
import Loading from '@/components/common/Loading';

const { Title } = Typography;

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading: postsLoading } = useSelector((state: RootState) => state.posts);
  const { allCategories, loading: categoriesLoading } = useSelector((state: RootState) => state.categories);
  const { allTags, loading: tagsLoading } = useSelector((state: RootState) => state.tags);
  
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchAdminPosts({ page: 0, size: 5 }));
    dispatch(fetchAllCategories());
    dispatch(fetchAllTags());
    
    // 获取统计信息
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const statsData = await apiService.getPostStats();
        setStats(statsData);
      } catch (error) {
        console.error('获取统计信息失败:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchStats();
  }, [dispatch]);

  const totalViews = posts.reduce((sum, post) => sum + post.viewCount, 0);
  const totalLikes = posts.reduce((sum, post) => sum + post.likeCount, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.commentCount, 0);

  const recentPosts = posts.slice(0, 5);
  const recentCategories = allCategories.slice(0, 5);
  const recentTags = allTags.slice(0, 5);

  return (
    <div>
      <Title level={2}>仪表盘</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="文章总数"
              value={stats.totalPosts}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="已发布"
              value={stats.publishedPosts}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="草稿"
              value={stats.draftPosts}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="分类总数"
              value={allCategories.length}
              prefix={<FolderOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="标签总数"
              value={allTags.length}
              prefix={<TagsOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总浏览量"
              value={totalViews}
              prefix={<EyeOutlined />}
              suffix="（最新5篇）"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最新文章" loading={postsLoading}>
            <List
              size="small"
              dataSource={recentPosts}
              renderItem={(post) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {post.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <span style={{ marginRight: '16px' }}>
                        浏览量: {post.viewCount}
                      </span>
                      <span style={{ marginRight: '16px' }}>
                        点赞: {post.likeCount}
                      </span>
                      <span>
                        评论: {post.commentCount}
                      </span>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <Card title="分类列表" loading={categoriesLoading}>
            <List
              size="small"
              dataSource={recentCategories}
              renderItem={(category) => (
                <List.Item>
                  <Tag color="blue">{category.name}</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <Card title="标签列表" loading={tagsLoading}>
            <List
              size="small"
              dataSource={recentTags}
              renderItem={(tag) => (
                <List.Item>
                  <Tag color={tag.color || 'default'}>
                    {tag.name} ({tag.postCount})
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
