import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message, Switch, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchAdminPosts, deletePost, pinPost, unpinPost } from '@/store/slices/postsSlice';
import { Post, PostStatus, Visibility } from '@/types';
import Loading from '@/components/common/Loading';
import SearchForm from '@/components/common/SearchForm';
import Pagination from '@/components/common/Pagination';
import { formatDate } from '@/utils/date';

const PostList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [messageApi, contextHolder] = message.useMessage();
  const { posts, pagination, loading, error } = useSelector((state: RootState) => state.posts);
  const { allCategories } = useSelector((state: RootState) => state.categories);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchParams, setSearchParams] = useState({
    page: 0,
    size: 10,
    keyword: '',
  });

  useEffect(() => {
    dispatch(fetchAdminPosts(searchParams));
  }, [dispatch, searchParams]);

  const handleSearch = (keyword: string) => {
    setSearchParams({
      ...searchParams,
      keyword: keyword,
      page: 0,
    });
  };

  const handlePageChange = (page: number, size: number) => {
    setSearchParams({
      ...searchParams,
      page: page - 1,
      size,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deletePost(id)).unwrap();
      messageApi.success('删除成功');
    } catch (error) {
      messageApi.error('删除失败');
    }
  };

  const handlePinToggle = async (record: Post, nextPinned: boolean) => {
    if (record.status !== PostStatus.PUBLISHED && nextPinned) {
      messageApi.warning('仅已发布的文章可以置顶');
      return;
    }

    try {
      if (nextPinned) {
        await dispatch(pinPost(record.id)).unwrap();
        messageApi.success('文章已置顶');
      } else {
        await dispatch(unpinPost(record.id)).unwrap();
        messageApi.success('已取消置顶');
      }
    } catch (error) {
      messageApi.error(nextPinned ? '置顶失败' : '取消置顶失败');
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

  const columns: ColumnsType<Post> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: Post) => (
        <Button type="link" onClick={() => navigate(`/admin/posts/${record.id}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId: number) => {
        const category = allCategories.find(cat => cat.id === categoryId);
        return category ? category.name : '-';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: PostStatus) => getStatusTag(status),
    },
    {
      title: '可见性',
      dataIndex: 'visibility',
      key: 'visibility',
      render: (visibility: Visibility) => getVisibilityTag(visibility),
    },
    {
      title: '置顶',
      dataIndex: 'pinned',
      key: 'pinned',
      render: (_: boolean, record: Post) => {
        const isPublished = record.status === PostStatus.PUBLISHED;
        const switchElement = (
          <Switch
            size="small"
            checked={record.pinned}
            onChange={(checked) => handlePinToggle(record, checked)}
            disabled={!isPublished || loading}
            checkedChildren="是"
            unCheckedChildren="否"
          />
        );

        if (isPublished) {
          return switchElement;
        }

        return (
          <Tooltip title="仅已发布文章支持置顶">
            <span>{switchElement}</span>
          </Tooltip>
        );
      },
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      key: 'viewCount',
      sorter: true,
    },
    {
      title: '点赞数',
      dataIndex: 'likeCount',
      key: 'likeCount',
      sorter: true,
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      render: (date: string) => date ? formatDate(date) : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      className: 'action-column',
      align: 'left',
      render: (_: any, record: Post) => (
        <Space size="small" wrap>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/posts/${record.slug}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/posts/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这篇文章吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return <div>错误: {error}</div>;
  }

  return (
    <div>
      {contextHolder}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px' 
      }}>
        <h2>文章管理</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/posts/new')}
        >
          新建文章
        </Button>
      </div>

      <SearchForm
        onSearch={handleSearch}
        loading={loading}
        placeholder="请输入搜索关键词"
        value={searchKeyword}
        onChange={setSearchKeyword}
      />

      <Loading spinning={loading}>
        <Table
          columns={columns}
          dataSource={posts}
          rowKey="id"
          pagination={false}
        />
      </Loading>

      <Pagination
        current={pagination.number + 1}
        total={pagination.totalElements}
        pageSize={pagination.size}
        onChange={handlePageChange}
      />
    </div>
  );
};

export default PostList;
