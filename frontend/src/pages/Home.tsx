import React, { useEffect } from 'react';
import { Row, Col, Card, Typography, List, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchAllCategories } from '@/store/slices/categoriesSlice';
import { fetchAllTags } from '@/store/slices/tagsSlice';
import PostList from '@/components/user/PostList';
import Loading from '@/components/common/Loading';
import GitHubContributions from '@/components/common/GitHubContributions';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allCategories, loading: categoriesLoading } = useSelector((state: RootState) => state.categories);
  const { allTags, loading: tagsLoading } = useSelector((state: RootState) => state.tags);

  useEffect(() => {
    dispatch(fetchAllCategories());
    dispatch(fetchAllTags());
  }, [dispatch]);

  const recentCategories = allCategories.slice(0, 5);
  const popularTags = [...allTags]
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 10);

  return (
    <div className="home-container">
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={17} xl={18}>
          <div className="home-header">
            <Title level={2} className="home-title">最新文章</Title>
            <Paragraph className="home-subtitle">分享技术心得，记录生活感悟</Paragraph>
          </div>
          <PostList />
        </Col>
        
        <Col xs={24} lg={7} xl={6}>
          <div className="sidebar-sticky">
            <Card 
              title={<span className="sidebar-card-title">文章分类</span>} 
              className="sidebar-card"
              variant="borderless"
            >
              <Loading spinning={categoriesLoading}>
                <List
                  size="small"
                  dataSource={recentCategories}
                  renderItem={(category) => (
                    <List.Item className="category-item">
                      <a href={`/categories/${category.slug}`} className="category-link">
                        {category.name}
                      </a>
                    </List.Item>
                  )}
                />
              </Loading>
            </Card>

            <Card 
              title={<span className="sidebar-card-title">热门标签</span>}
              className="sidebar-card"
              variant="borderless"
            >
              <Loading spinning={tagsLoading}>
                <div className="tags-container">
                  {popularTags.map((tag) => (
                    <Tag
                      key={tag.id}
                      color={tag.color || 'blue'}
                      className="tag-item"
                    >
                      <a href={`/tags/${tag.slug}`}>
                        {tag.name} ({tag.postCount})
                      </a>
                    </Tag>
                  ))}
                </div>
              </Loading>
            </Card>

            <GitHubContributions className="sidebar-card" />

            <Card 
              title={<span className="sidebar-card-title">关于博客</span>}
              className="sidebar-card"
              variant="borderless"
            >
              <Paragraph className="about-text">
                欢迎来到RuleViz的博客！这里记录着我的技术学习心得、项目开发经验以及前沿AI技术。
                希望我的分享能对您有所帮助。
              </Paragraph>
              <Paragraph className="about-text">
                如果您有任何问题或建议，欢迎通过联系方式与我交流。
              </Paragraph>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
