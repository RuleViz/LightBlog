import React from 'react';
import { Space, Typography, Tag } from 'antd';
import { EyeOutlined, HeartOutlined, MessageOutlined, LockOutlined, CalendarOutlined, PushpinFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Post, Visibility } from '@/types';
import { formatDate } from '@/utils/date';
import LazyImage from '@/components/common/LazyImage';
import './PostListItem.css';

const { Title, Paragraph, Text } = Typography;

interface PostListItemProps {
  post: Post;
  showExcerpt?: boolean;
}

const PostListItem: React.FC<PostListItemProps> = React.memo(({ post, showExcerpt = true }) => {
  const navigate = useNavigate();

  const handleClick = React.useCallback(() => {
    navigate(`/posts/${post.slug}`);
  }, [navigate, post.slug]);

  return (
    <div className="post-list-item" onClick={handleClick}>
      <div className="post-list-item-content">
        {/* 左侧封面图 */}
        {post.coverImageUrl && (
          <div className="post-cover">
            <LazyImage 
              src={post.coverImageUrl} 
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* 主要内容区 */}
        <div className="post-main">
          {/* 标题行 */}
          <div className="post-header">
            {post.pinned && (
              <Tag color="gold" className="post-pinned-tag">
                <PushpinFilled />
                置顶
              </Tag>
            )}
            <Title level={3} className="post-title">
              {post.visibility === Visibility.PASSWORD && (
                <LockOutlined className="lock-icon" />
              )}
              {post.title}
            </Title>
          </div>

          {/* 摘要 */}
          {showExcerpt && post.excerpt && (
            <Paragraph className="post-excerpt" ellipsis={{ rows: 2 }}>
              {post.excerpt}
            </Paragraph>
          )}

          {/* 元数据信息 */}
          <div className="post-meta">
            <Space size="large" wrap>
              <Space className="post-date">
                <CalendarOutlined />
                <Text type="secondary">{formatDate(post.publishedAt || post.createdAt)}</Text>
              </Space>
              
              <Space>
                <EyeOutlined />
                <Text type="secondary">{post.viewCount}</Text>
              </Space>
              
              <Space>
                <HeartOutlined />
                <Text type="secondary">{post.likeCount}</Text>
              </Space>
              
              <Space>
                <MessageOutlined />
                <Text type="secondary">{post.commentCount}</Text>
              </Space>

              {/* 标签 */}
              {post.tags && post.tags.length > 0 && (
                <Space size="small" className="post-tags">
                  {post.tags.slice(0, 3).map(tag => (
                    <Tag 
                      key={tag.id} 
                      color={tag.color || 'blue'}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tags/${tag.slug}`);
                      }}
                    >
                      {tag.name}
                    </Tag>
                  ))}
                  {post.tags.length > 3 && (
                    <Text type="secondary">+{post.tags.length - 3}</Text>
                  )}
                </Space>
              )}
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，只在post.id相同且showExcerpt相同时跳过重渲染
  return prevProps.post.id === nextProps.post.id &&
         prevProps.showExcerpt === nextProps.showExcerpt &&
         prevProps.post.pinned === nextProps.post.pinned &&
         prevProps.post.pinnedAt === nextProps.post.pinnedAt &&
         prevProps.post.updatedAt === nextProps.post.updatedAt;
});

PostListItem.displayName = 'PostListItem';

export default PostListItem;

