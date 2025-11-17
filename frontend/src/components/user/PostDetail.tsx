import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, Typography, Tag, Space, Button, Input, FloatButton, App } from 'antd';
import { EyeOutlined, HeartOutlined, MessageOutlined, CalendarOutlined, LockOutlined, LeftOutlined, InfoCircleOutlined, CloseOutlined, CopyOutlined, ZoomInOutlined, ZoomOutOutlined, RedoOutlined } from '@ant-design/icons';
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
import { decodeImageAlt } from '@/utils/imageSize';

const { Title, Paragraph, Text } = Typography;

const MIN_ZOOM_LEVEL = 1;
const MAX_ZOOM_LEVEL = 4;
const ZOOM_STEP = 0.25;

const PostDetail: React.FC = () => {
  const { message } = App.useApp();
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
  const [collapsedCodeBlocks, setCollapsedCodeBlocks] = useState<Set<number>>(new Set());
  const codeBlockCounterRef = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [viewerState, setViewerState] = useState<{ visible: boolean; src: string; alt: string }>({
    visible: false,
    src: '',
    alt: '',
  });
  const [viewerScale, setViewerScale] = useState<number>(MIN_ZOOM_LEVEL);
  const [viewerTranslate, setViewerTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const draggingRef = useRef(false);
  const lastPointerPositionRef = useRef({ x: 0, y: 0 });
  const originalBodyOverflowRef = useRef<string>('');
  const defaultTitleRef = useRef<string>(document.title);

  const fetchedRef = useRef(false);

  const openImageViewer = useCallback((src: string, alt?: string) => {
    if (!src) return;

    setViewerState({
      visible: true,
      src,
      alt: alt || '图片预览',
    });
    setViewerScale(MIN_ZOOM_LEVEL);
    setViewerTranslate({ x: 0, y: 0 });
    setIsDraggingImage(false);
  }, []);

  const closeImageViewer = useCallback(() => {
    setViewerState({
      visible: false,
      src: '',
      alt: '',
    });
    setViewerScale(MIN_ZOOM_LEVEL);
    setViewerTranslate({ x: 0, y: 0 });
    draggingRef.current = false;
    setIsDraggingImage(false);
  }, []);

  const resetViewerTransform = useCallback(() => {
    setViewerScale(MIN_ZOOM_LEVEL);
    setViewerTranslate({ x: 0, y: 0 });
    draggingRef.current = false;
    setIsDraggingImage(false);
  }, []);

  const adjustZoom = useCallback((delta: number) => {
    setViewerScale(prev => {
      const next = Math.min(MAX_ZOOM_LEVEL, Math.max(MIN_ZOOM_LEVEL, prev + delta));
      if (next === MIN_ZOOM_LEVEL) {
        setViewerTranslate({ x: 0, y: 0 });
        draggingRef.current = false;
        setIsDraggingImage(false);
      }
      return Number(next.toFixed(2));
    });
  }, []);

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
    if (!viewerState.visible) {
      document.body.style.overflow = originalBodyOverflowRef.current || '';
      return;
    }

    originalBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeImageViewer();
      } else if (event.key === '+' || event.key === '=') {
        adjustZoom(ZOOM_STEP);
      } else if (event.key === '-' || event.key === '_') {
        adjustZoom(-ZOOM_STEP);
      } else if (event.key === '0' || event.key === ' ') {
        resetViewerTransform();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflowRef.current || '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewerState.visible, closeImageViewer, adjustZoom, resetViewerTransform]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = originalBodyOverflowRef.current || '';
    };
  }, []);

  useEffect(() => {
    const handlePointerUp = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        setIsDraggingImage(false);
      }
    };

    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('mouseleave', handlePointerUp);

    return () => {
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('mouseleave', handlePointerUp);
    };
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
          // 检查错误状态码，只有401才显示密码输入框
          const payload = action.payload as { status?: number; message?: string };
          if (payload?.status === 401) {
            setShowPasswordForm(true);
            dispatch(clearError());
          }
          // 其他错误（404等）会显示错误页面
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
      // 重置代码块计数器和折叠状态
      codeBlockCounterRef.current = 0;
      setCollapsedCodeBlocks(new Set());
    }
  }, [currentPost]);

  useEffect(() => {
    if (currentPost?.title) {
      document.title = currentPost.title;
      return;
    }

    if (!loading) {
      document.title = defaultTitleRef.current;
    }
  }, [currentPost?.title, loading]);

  useEffect(() => {
    return () => {
      document.title = defaultTitleRef.current;
    };
  }, []);

  useEffect(() => {
    if (!contentRef.current || currentPost?.contentType !== 'HTML') {
      return;
    }

    const container = contentRef.current;
    const images = Array.from(container.querySelectorAll<HTMLImageElement>('img'));

    if (!images.length) {
      return;
    }

    const handleImageClick = (event: Event) => {
      const target = event.currentTarget as HTMLImageElement;
      const src = target.currentSrc || target.src;
      const { altText } = decodeImageAlt(target.alt);
      const displayAlt = altText || target.alt || currentPost?.title || '图片预览';
      openImageViewer(src, displayAlt);
    };

    images.forEach(img => {
      img.classList.add('zoomable-inline-image');
      img.addEventListener('click', handleImageClick);
    });

    return () => {
      images.forEach(img => {
        img.classList.remove('zoomable-inline-image');
        img.removeEventListener('click', handleImageClick);
      });
    };
  }, [currentPost?.content, currentPost?.contentType, currentPost?.title, openImageViewer]);

  const handleViewerWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!viewerState.visible) return;
      const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      adjustZoom(delta);
    },
    [viewerState.visible, adjustZoom]
  );

  const handleViewerMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (viewerScale <= MIN_ZOOM_LEVEL + 0.01) return;
      event.preventDefault();
      draggingRef.current = true;
      setIsDraggingImage(true);
      lastPointerPositionRef.current = { x: event.clientX, y: event.clientY };
    },
    [viewerScale]
  );

  const handleViewerMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    event.preventDefault();
    const deltaX = event.clientX - lastPointerPositionRef.current.x;
    const deltaY = event.clientY - lastPointerPositionRef.current.y;
    lastPointerPositionRef.current = { x: event.clientX, y: event.clientY };
    setViewerTranslate(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  }, []);

  const endDragging = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDraggingImage(false);
  }, []);

  const handleViewerMouseUp = useCallback(() => {
    endDragging();
  }, [endDragging]);

  const handleViewerMouseLeave = useCallback(() => {
    endDragging();
  }, [endDragging]);

  const handleViewerDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      resetViewerTransform();
    },
    [resetViewerTransform]
  );

  const handleStageClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  }, []);

  const isZoomed = viewerScale > MIN_ZOOM_LEVEL + 0.001;
  const zoomPercentage = Math.round(viewerScale * 100);

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
    };
    const config = statusMap[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getVisibilityTag = (visibility: Visibility) => {
    const visibilityMap = {
      [Visibility.PUBLIC]: { color: 'green', text: '公开' },
      [Visibility.PASSWORD]: { color: 'orange', text: '密码保护' },
    };
    const config = visibilityMap[visibility];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 复制代码到剪贴板
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      message.success('代码已复制到剪贴板');
    } catch (error) {
      message.error('复制失败');
    }
  };

  // 切换代码块折叠状态
  const toggleCodeBlock = (index: number) => {
    setCollapsedCodeBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
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

    return (
      <div>
        {currentPost.coverImageUrl && (
          <img
            src={currentPost.coverImageUrl}
            alt={currentPost.title}
            className="zoomable-inline-image post-cover-image"
            style={{ 
              width: '100%', 
              height: '300px', 
              objectFit: 'cover',
              marginBottom: '24px',
              borderRadius: '8px'
            }}
            loading="lazy"
            onClick={() => currentPost.coverImageUrl && openImageViewer(currentPost.coverImageUrl, currentPost.title)}
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
          <Card className="excerpt-card" style={{ marginBottom: '24px' }}>
            <Paragraph style={{ fontSize: '16px', fontStyle: 'italic', margin: 0 }}>
              {currentPost.excerpt}
            </Paragraph>
          </Card>
        )}

        <div ref={contentRef} style={{ lineHeight: '1.8', fontSize: '16px' }}>
          {currentPost.contentType === 'MARKDOWN' ? (
            (() => {
              // 每次渲染时重置代码块计数器
              codeBlockCounterRef.current = 0;
              return (
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      if (!inline && match) {
                        const codeString = String(children).replace(/\n$/, '');
                        const codeBlockIndex = codeBlockCounterRef.current++;
                        const isCollapsed = collapsedCodeBlocks.has(codeBlockIndex);
                        
                        return (
                          <div className="code-block-wrapper">
                            <div className="code-block-header">
                              <div className="code-block-dots" onClick={() => toggleCodeBlock(codeBlockIndex)}>
                                <span className="dot dot-red"></span>
                                <span className="dot dot-yellow"></span>
                                <span className="dot dot-green"></span>
                              </div>
                              <span className="code-block-language">{match[1]}</span>
                              <Button
                                type="text"
                                size="small"
                                icon={<CopyOutlined />}
                                className="code-block-copy-btn"
                                onClick={() => handleCopyCode(codeString)}
                              />
                            </div>
                            {!isCollapsed && (
                              <SyntaxHighlighter
                                style={isDarkMode ? atomDark : oneLight}
                                language={match[1]}
                                PreTag="div"
                                showLineNumbers={true}
                                wrapLines={true}
                                customStyle={{
                                  borderRadius: '0 0 8px 8px',
                                  fontSize: '13.44px',
                                  padding: '20px',
                                  margin: '0',
                                  border: 'none',
                                }}
                                codeTagProps={{
                                  style: {
                                    fontSize: '13.44px',
                                    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                                  }
                                }}
                                {...(props as any)}
                              >
                                {codeString}
                              </SyntaxHighlighter>
                            )}
                          </div>
                        );
                      }
                      return (
                        <code className="inline-code" {...(props as any)}>
                          {children}
                        </code>
                      );
                    },
                    img({ node, ...props }: any) {
                      const src = props.src || '';
                      const { altText, size } = decodeImageAlt(props.alt);
                      const displayAlt = (altText || currentPost.title || '图片').trim();
                      const className = ['zoomable-inline-image', props.className].filter(Boolean).join(' ');
                      const inlineStyle = {
                        ...(props.style || {}),
                        width: `${size}%`,
                        maxWidth: '100%',
                        height: 'auto',
                      };

                      return (
                        <img
                          {...props}
                          src={src}
                          alt={displayAlt}
                          className={className}
                          style={inlineStyle}
                          loading={props.loading ?? 'lazy'}
                          onClick={() => openImageViewer(src, displayAlt)}
                        />
                      );
                    },
                  }}
                >
                  {currentPost.content}
                </ReactMarkdown>
              );
            })()
          ) : (
            <div className="html-content" dangerouslySetInnerHTML={{ __html: currentPost.content }} />
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
    <>
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

      {viewerState.visible && (
        <div className="image-viewer-overlay" onClick={closeImageViewer}>
          <div className="image-viewer-toolbar" onClick={event => event.stopPropagation()}>
            <Button
              type="text"
              icon={<ZoomOutOutlined />}
              disabled={viewerScale <= MIN_ZOOM_LEVEL}
              onClick={event => {
                event.stopPropagation();
                adjustZoom(-ZOOM_STEP);
              }}
            />
            <span className="image-viewer-scale">{zoomPercentage}%</span>
            <Button
              type="text"
              icon={<ZoomInOutlined />}
              disabled={viewerScale >= MAX_ZOOM_LEVEL}
              onClick={event => {
                event.stopPropagation();
                adjustZoom(ZOOM_STEP);
              }}
            />
            <Button
              type="text"
              icon={<RedoOutlined />}
              onClick={event => {
                event.stopPropagation();
                resetViewerTransform();
              }}
            />
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={event => {
                event.stopPropagation();
                closeImageViewer();
              }}
            />
          </div>
          <div
            className={`image-viewer-stage ${isZoomed ? 'is-zoomed' : ''} ${isDraggingImage ? 'dragging' : ''}`}
            onClick={handleStageClick}
            onMouseDown={handleViewerMouseDown}
            onMouseMove={handleViewerMouseMove}
            onMouseUp={handleViewerMouseUp}
            onMouseLeave={handleViewerMouseLeave}
            onDoubleClick={handleViewerDoubleClick}
            onWheel={handleViewerWheel}
          >
            <img
              src={viewerState.src}
              alt={viewerState.alt}
              className="image-viewer-img"
              style={{
                transform: `translate(${viewerTranslate.x}px, ${viewerTranslate.y}px) scale(${viewerScale})`,
              }}
              draggable={false}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PostDetail;
