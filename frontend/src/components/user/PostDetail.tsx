import React, { useEffect, useState, useRef } from 'react';
import { Card, Typography, Tag, Space, Button, Input, message, FloatButton } from 'antd';
import { EyeOutlined, HeartOutlined, MessageOutlined, CalendarOutlined, LockOutlined, LeftOutlined, InfoCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchPostBySlug, clearCurrentPost, clearError } from '@/store/slices/postsSlice';
import { fetchAllCategories } from '@/store/slices/categoriesSlice';
import { PostStatus, Visibility, LikeTargetType } from '@/types';
import { apiService } from '@/services/api';
import { formatDate } from '@/utils/date';
import Loading from '@/components/common/Loading';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './PostDetail.css';

const { Title, Paragraph, Text } = Typography;

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentPost, loading, error } = useSelector((state: RootState) => state.posts);
  const { allCategories } = useSelector((state: RootState) => state.categories);

  const [password, setPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.getAttribute('data-theme') === 'dark'
  );

  const fetchedRef = useRef(false);

  // 监听主题变化
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (fetchedRef.current) {
      return () => {
        dispatch(clearCurrentPost());
      };
    }
    fetchedRef.current = true;

    const load = async () => {
      if (slug) {
        const action = await dispatch(fetchPostBySlug(slug));
        if (fetchPostBySlug.rejected.match(action)) {
          // 受保护文章：后端返回401
          setShowPasswordForm(true);
          dispatch(clearError());
        }
      }
      dispatch(fetchAllCategories());
    };

    load();

    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, slug]);

  useEffect(() => {
    if (currentPost) {
      setLikeCount(currentPost.likeCount);
      checkLikeStatus();
    }
  }, [currentPost]);

  const checkLikeStatus = async () => {
    if (currentPost) {
      try {
        const liked = await apiService.isLiked(LikeTargetType.POST, currentPost.id);
        setIsLiked(liked);
      } catch (error) {
        console.error('检查点赞状态失败:', error);
      }
    }
  };

  const handleLike = async () => {
    if (!currentPost) return;

    try {
      if (isLiked) {
        await apiService.unlikePost(LikeTargetType.POST, currentPost.id);
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
        message.success('取消点赞');
      } else {
        await apiService.likePost(LikeTargetType.POST, currentPost.id);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        message.success('点赞成功');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      message.warning('请输入密码');
      return;
    }
    try {
      if (!slug) return;
      await apiService.verifyPostPasswordBySlug(slug, password);
      message.success('密码验证成功');
      setShowPasswordForm(false);
      setPassword('');
      await dispatch(fetchPostBySlug(slug)).unwrap();
    } catch (e: any) {
      if (e?.response?.status === 401) {
        message.error('密码错误，请重试');
      } else {
        message.error('验证失败');
      }
    }
  };

  const getStatusTag = (status: PostStatus) => {
    const statusMap = {
      [PostStatus.DRAFT]: { color: 'default', text: '草稿' },
      [PostStatus.PUBLISHED]: { color: 'success', text: '已发布' },
      [PostStatus.ARCHIVED]: { color: 'warning', text: '已归档' },
    };
    const config = statusMap[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getVisibilityTag = (visibility: Visibility) => {
    const visibilityMap = {
      [Visibility.PUBLIC]: { color: 'green', text: '公开' },
      [Visibility.PRIVATE]: { color: 'red', text: '私有' },
      [Visibility.PASSWORD]: { color: 'orange', text: '密码保护' },
    };
    const config = visibilityMap[visibility];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const renderContent = () => {
    if (!currentPost) return null;

    if ((currentPost?.visibility === Visibility.PASSWORD && showPasswordForm) || (!currentPost && showPasswordForm)) {
      return (
        <Card style={{ textAlign: 'center', margin: '20px 0' }}>
          <LockOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={3}>此文章需要密码访问</Title>
          <Paragraph>请输入访问密码：</Paragraph>
          <Space.Compact style={{ width: '300px' }}>
            <Input.Password
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onPressEnter={handlePasswordSubmit}
            />
            <Button type="primary" onClick={handlePasswordSubmit}>
              确认
            </Button>
          </Space.Compact>
        </Card>
      );
    }

    if (currentPost.visibility === Visibility.PRIVATE) {
      return (
        <Card style={{ textAlign: 'center', margin: '20px 0' }}>
          <Title level={3}>此文章为私有文章</Title>
          <Paragraph>您没有权限访问此文章。</Paragraph>
          <Button type="primary" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </Card>
      );
    }

    return (
      <div>
        {currentPost.coverImageUrl && (
          <img
            src={currentPost.coverImageUrl}
            alt={currentPost.title}
            style={{ 
              width: '100%', 
              height: '300px', 
              objectFit: 'cover',
              marginBottom: '24px',
              borderRadius: '8px'
            }}
          />
        )}

        <div style={{ marginBottom: '24px' }}>
          <Space wrap>
            {getStatusTag(currentPost.status)}
            {getVisibilityTag(currentPost.visibility)}
            {currentPost.categoryId && (
              <Tag color="blue">
                {allCategories.find(cat => cat.id === currentPost.categoryId)?.name || '未知分类'}
              </Tag>
            )}
          </Space>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Space>
            <Space>
              <EyeOutlined />
              <Text>{currentPost.viewCount}</Text>
            </Space>
            <Space>
              <HeartOutlined 
                style={{ color: isLiked ? '#ff4d4f' : undefined, cursor: 'pointer' }}
                onClick={handleLike}
              />
              <Text>{likeCount}</Text>
            </Space>
            <Space>
              <MessageOutlined />
              <Text>{currentPost.commentCount}</Text>
            </Space>
            <Space>
              <CalendarOutlined />
              <Text>
                {currentPost.publishedAt 
                  ? formatDate(currentPost.publishedAt) 
                  : formatDate(currentPost.createdAt)
                }
              </Text>
            </Space>
          </Space>
        </div>

        {currentPost.excerpt && (
          <Card style={{ marginBottom: '24px', background: '#f8f9fa' }}>
            <Paragraph style={{ fontSize: '16px', fontStyle: 'italic', margin: 0 }}>
              {currentPost.excerpt}
            </Paragraph>
          </Card>
        )}

        <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
          {currentPost.contentType === 'MARKDOWN' ? (
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={isDarkMode ? atomDark : oneLight}
                      language={match[1]}
                      PreTag="div"
                      showLineNumbers={true}
                      wrapLines={true}
                      customStyle={{
                        borderRadius: '8px',
                        fontSize: '13.44px',
                        padding: '20px',
                        margin: '24px 0',
                        border: isDarkMode ? '1px solid #444' : '1px solid #e1e4e8',
                      }}
                      codeTagProps={{
                        style: {
                          fontSize: '13.44px',
                          fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                        }
                      }}
                      {...(props as any)}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="inline-code" {...(props as any)}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {currentPost.content}
            </ReactMarkdown>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: currentPost.content }} />
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (showPasswordForm) {
    return (
      <Card style={{ textAlign: 'center', margin: '20px 0' }}>
        <LockOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
        <Title level={3}>此文章需要密码访问</Title>
        <Paragraph>请输入访问密码：</Paragraph>
        <Space.Compact style={{ width: '300px' }}>
          <Input.Password
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPressEnter={handlePasswordSubmit}
          />
          <Button type="primary" onClick={handlePasswordSubmit}>
            确认
          </Button>
        </Space.Compact>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={{ textAlign: 'center', margin: '20px 0' }}>
        <Title level={3}>文章加载失败</Title>
        <Paragraph>{error}</Paragraph>
        <Button type="primary" onClick={() => navigate('/')}>
          返回首页
        </Button>
      </Card>
    );
  }

  if (!currentPost) {
    return (
      <Card style={{ textAlign: 'center', margin: '20px 0' }}>
        <Title level={3}>文章不存在</Title>
        <Paragraph>您访问的文章不存在或已被删除。</Paragraph>
        <Button type="primary" onClick={() => navigate('/')}>
          返回首页
        </Button>
      </Card>
    );
  }

  return (
    <div className="post-detail-container">
      <div className="post-detail-wrapper">
        {/* 主内容区 - 全宽 */}
        <div className="post-detail-main-fullwidth">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Button type="text" icon={<LeftOutlined />} onClick={() => navigate(-1)}>
              返回
            </Button>
          </div>
          <Title level={1} style={{ marginBottom: '16px' }}>
            {currentPost.title}
          </Title>
          
          {renderContent()}
        </div>

        {/* 悬浮侧边栏 */}
        <aside className={`post-detail-sidebar-floating ${sidebarVisible ? 'visible' : ''}`}>
          <div className="sidebar-floating-header">
            <span>文章信息</span>
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={() => setSidebarVisible(false)}
              size="small"
            />
          </div>
          
          <div className="sidebar-floating-content">
            {/* 文章信息卡片 */}
            <Card className="sidebar-card" title="基本信息" size="small">
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>发布时间</Text>
                  <div style={{ fontSize: '14px' }}>
                    {currentPost.publishedAt 
                      ? formatDate(currentPost.publishedAt) 
                      : formatDate(currentPost.createdAt)}
                  </div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>阅读量</Text>
                  <div style={{ fontSize: '14px' }}>{currentPost.viewCount} 次</div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>点赞数</Text>
                  <div style={{ fontSize: '14px' }}>{likeCount} 个</div>
                </div>
                {currentPost.categoryId && (
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>分类</Text>
                    <div>
                      <Tag color="blue" style={{ marginTop: 4 }}>
                        {allCategories.find(cat => cat.id === currentPost.categoryId)?.name || '未知分类'}
                      </Tag>
                    </div>
                  </div>
                )}
                {currentPost.tags && currentPost.tags.length > 0 && (
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>标签</Text>
                    <div style={{ marginTop: 4 }}>
                      <Space wrap size="small">
                        {currentPost.tags.map(tag => (
                          <Tag key={tag.id} color="geekblue" style={{ fontSize: '12px' }}>{tag.name}</Tag>
                        ))}
                      </Space>
                    </div>
                  </div>
                )}
              </Space>
            </Card>

            {/* 快速操作卡片 */}
            <Card className="sidebar-card" title="快速操作" size="small">
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Button 
                  type={isLiked ? 'primary' : 'default'} 
                  icon={<HeartOutlined />} 
                  onClick={handleLike}
                  block
                  danger={isLiked}
                  size="small"
                >
                  {isLiked ? '已点赞' : '点赞'}
                </Button>
                <Button icon={<MessageOutlined />} block size="small">
                  评论 ({currentPost.commentCount})
                </Button>
              </Space>
            </Card>
          </div>
        </aside>

        {/* 悬浮按钮 - 打开侧边栏 */}
        <FloatButton
          icon={<InfoCircleOutlined />}
          description="文章信息"
          shape="square"
          type="primary"
          style={{ right: 24, bottom: 24 }}
          onClick={() => setSidebarVisible(true)}
        />

        {/* 遮罩层 */}
        {sidebarVisible && (
          <div 
            className="sidebar-overlay" 
            onClick={() => setSidebarVisible(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PostDetail;
