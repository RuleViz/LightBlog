import React, { useEffect } from 'react';
import { Row, Col, Card, Typography, Tag, Breadcrumb, Empty, Spin } from 'antd';
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store';
import { fetchAllCategories } from '@/store/slices/categoriesSlice';

const { Title, Paragraph } = Typography;

const AllCategoriesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { allCategories, loading } = useSelector((state: RootState) => state.categories);

  const breadcrumbItems = [
    {
      title: (
        <span className="breadcrumb-link" onClick={() => navigate('/')}
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <HomeOutlined /> 首页
        </span>
      ),
    },
    {
      title: '全部分类',
    },
  ];

  useEffect(() => {
    if (allCategories.length === 0) {
      dispatch(fetchAllCategories());
    }
  }, [dispatch, allCategories.length]);

  return (
    <div className="page-container">
      <Breadcrumb style={{ marginBottom: '24px' }} items={breadcrumbItems} />

      <div className="page-header-section">
        <Title level={2} className="page-title">分类导航</Title>
        <Paragraph className="page-description">
          精选技术主题，点击任意分类即可查看对应文章。
        </Paragraph>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <Spin indicator={<AppstoreOutlined spin style={{ fontSize: 32, color: 'var(--primary-color)' }} />} />
        </div>
      ) : allCategories.length === 0 ? (
        <Empty
          description="暂无分类"
          style={{ padding: '80px 0' }}
        />
      ) : (
        <Row gutter={[24, 24]}>
          {allCategories.map((category) => (
            <Col xs={24} sm={12} lg={8} key={category.id}>
              <Card
                hoverable
                className="category-card"
                onClick={() => navigate(`/categories/${category.slug}`)}
              >
                <div className="category-card-header">
                  <Title level={4} className="category-card-title">
                    {category.name}
                  </Title>
                  {category.postCount !== undefined && (
                    <Tag color="blue">{category.postCount} 篇文章</Tag>
                  )}
                </div>
                {category.description && (
                  <Paragraph className="category-card-description">
                    {category.description}
                  </Paragraph>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default AllCategoriesPage;
