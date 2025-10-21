import React, { useEffect } from 'react';
import { Row, Col, Card, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchAllTags } from '@/store/slices/tagsSlice';
import PostList from '@/components/user/PostList';
import Loading from '@/components/common/Loading';
import GitHubContributions from '@/components/common/GitHubContributions';

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allTags, loading: tagsLoading } = useSelector((state: RootState) => state.tags);

  useEffect(() => {
    dispatch(fetchAllTags());
  }, [dispatch]);

  const popularTags = [...allTags]
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 10);

  return (
    <div className="home-container">
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={17} xl={18}>
          <PostList />
        </Col>
        
        <Col xs={24} lg={7} xl={6}>
          <div className="sidebar-sticky">
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
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
