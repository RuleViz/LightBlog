import React from 'react';
import { Card, Tag, Space, Typography } from 'antd';
import { EyeOutlined, HeartOutlined, MessageOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Post, PostStatus, Visibility } from '@/types';
// import { formatDate } from '@/utils/date';
import LazyImage from '@/components/common/LazyImage';

const { Title, Paragraph } = Typography;

interface PostCardProps {
  post: Post;
  showExcerpt?: boolean;
}

const PostCard: React.FC<PostCardProps> = React.memo(({ post, showExcerpt = true }) => {
  const navigate = useNavigate();

  const getStatusTag = React.useCallback((status: PostStatus) => {
    const statusMap = {
      [PostStatus.DRAFT]: { color: 'default', text: '草稿' },
      [PostStatus.PUBLISHED]: { color: 'success', text: '已发布' },
      [PostStatus.ARCHIVED]: { color: 'warning', text: '已归档' },
    };
    const config = statusMap[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  }, []);

  const getVisibilityTag = React.useCallback((visibility: Visibility) => {
    const visibilityMap = {
      [Visibility.PUBLIC]: { color: 'green', text: '公开' },
      [Visibility.PRIVATE]: { color: 'red', text: '私有' },
      [Visibility.PASSWORD]: { color: 'orange', text: '密码保护' },
    };
    const config = visibilityMap[visibility];
    return <Tag color={config.color}>{config.text}</Tag>;
  }, []);

  const handleClick = React.useCallback(() => {
    navigate(`/posts/${post.slug}`);
  }, [navigate, post.slug]);

  return (
    <Card
      hoverable
      style={{ marginBottom: '16px' }}
      cover={
        post.coverImageUrl ? (
          <div style={{ height: '200px', overflow: 'hidden' }}>
            <LazyImage
              alt={post.title}
              src={post.coverImageUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : null
      }
      actions={[
        <Space key="views">
          <EyeOutlined />
          {post.viewCount}
        </Space>,
        <Space key="likes">
          <HeartOutlined />
          {post.likeCount}
        </Space>,
        <Space key="comments">
          <MessageOutlined />
          {post.commentCount}
        </Space>,
      ]}
      onClick={handleClick}
    >
      <Card.Meta
        title={
          <Title level={4} style={{ margin: 0, cursor: 'pointer' }}>
            {post.visibility === Visibility.PASSWORD && (
              <LockOutlined style={{ marginRight: '8px', color: '#faad14' }} />
            )}
            {post.title}
          </Title>
        }
        description={
          <div>
            {showExcerpt && post.excerpt && (
              <Paragraph 
                ellipsis={{ rows: 2, expandable: false }} 
                style={{ marginBottom: '12px' }}
              >
                {post.excerpt}
              </Paragraph>
            )}
            <Space wrap>
              {getStatusTag(post.status)}
              {getVisibilityTag(post.visibility)}
            </Space>
          </div>
        }
      />
    </Card>
  );
}, (prevProps, nextProps) => {
  return prevProps.post.id === nextProps.post.id && 
         prevProps.showExcerpt === nextProps.showExcerpt;
});

PostCard.displayName = 'PostCard';

export default PostCard;
