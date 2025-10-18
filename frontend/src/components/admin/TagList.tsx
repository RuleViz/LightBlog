import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message, Modal, Form, Input, ColorPicker } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchTags, createTag, updateTag, deleteTag } from '@/store/slices/tagsSlice';
import { Tag as TagType, TagCreateRequest, TagUpdateRequest } from '@/types';
import { generateSlug } from '@/utils/string';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';

const TagList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tags, pagination, loading, error } = useSelector((state: RootState) => state.tags);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [form] = Form.useForm();

  const [searchParams, setSearchParams] = useState({
    page: 0,
    size: 10,
  });

  const [warningContent, setWarningContent] = useState<string | null>(null);
  const [messageInfo, setMessageInfo] = useState<{ type: 'success' | 'error'; content: string } | null>(null);

  useEffect(() => {
    dispatch(fetchTags(searchParams));
  }, [dispatch, searchParams]);

  const handleAdd = () => {
    setEditingTag(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (tag: TagType) => {
    setEditingTag(tag);
    form.setFieldsValue({
      name: tag.name,
      slug: tag.slug,
      color: tag.color,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteTag(id)).unwrap();
      setMessageInfo({ type: 'success', content: '删除成功' });
    } catch (error: any) {
      const data = error?.payload || error?.response?.data;
      const errorMessage = data?.message || error?.message || '删除失败';
      if (data?.message) {
        setWarningContent(errorMessage);
      } else {
        setMessageInfo({ type: 'error', content: errorMessage });
      }
    }
  };

  useEffect(() => {
    if (warningContent) {
      Modal.warning({ title: '无法删除标签', content: warningContent });
      setWarningContent(null);
    }
  }, [warningContent]);

  useEffect(() => {
    if (messageInfo) {
      message[messageInfo.type](messageInfo.content);
      setMessageInfo(null);
    }
  }, [messageInfo]);

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 处理数据，确保格式正确
      const processedValues = {
        name: values.name.trim(),
        // 如果没有提供slug或slug为空字符串，自动生成
        slug: values.slug && values.slug.trim() ? values.slug.trim() : generateSlug(values.name),
        // 处理颜色值，确保不超过7个字符
        color: values.color ? (typeof values.color === 'string' ? values.color.substring(0, 7) : values.color.toHexString().substring(0, 7)) : undefined
      };
      
      console.log('发送给后端的标签数据:', processedValues);
      
      if (editingTag) {
        await dispatch(updateTag({ 
          id: editingTag.id, 
          data: processedValues as TagUpdateRequest 
        })).unwrap();
        message.success('标签更新成功');
      } else {
        await dispatch(createTag(processedValues as TagCreateRequest)).unwrap();
        message.success('标签创建成功');
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('标签操作失败:', error);
      message.error(editingTag ? '标签更新失败' : '标签创建失败');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handlePageChange = (page: number, size: number) => {
    setSearchParams({
      ...searchParams,
      page: page - 1,
      size,
    });
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: TagType) => (
        <Space>
          <Tag color={record.color || 'blue'}>{text}</Tag>
        </Space>
      ),
    },
    {
      title: '别名',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <Space>
          <div 
            style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: color || '#1890ff',
              borderRadius: '4px',
              border: '1px solid #d9d9d9'
            }}
          />
          <span>{color || '#1890ff'}</span>
        </Space>
      ),
    },
    {
      title: '文章数量',
      dataIndex: 'postCount',
      key: 'postCount',
      sorter: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: TagType) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个标签吗？"
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px' 
      }}>
        <h2>标签管理</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          新建标签
        </Button>
      </div>

      <Loading spinning={loading}>
        <Table
          columns={columns}
          dataSource={tags}
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

      <Modal
        title={editingTag ? '编辑标签' : '新建标签'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="标签名称"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="别名"
            rules={[{ required: false }]}
          >
            <Input placeholder="留空将自动生成别名" />
          </Form.Item>

          <Form.Item
            name="color"
            label="颜色"
          >
            <ColorPicker 
              showText 
              format="hex"
              placeholder="选择颜色"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagList;
