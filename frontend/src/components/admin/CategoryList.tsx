import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Modal, Form, Input, InputNumber, Space } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchCategories, deleteCategory, createCategory, updateCategory } from '@/store/slices/categoriesSlice';
import { Category, CategoryCreateRequest, CategoryUpdateRequest } from '@/types';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import { generateSlug } from '@/utils/string';

const { TextArea } = Input;

const CategoryList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, pagination, loading, error } = useSelector((state: RootState) => state.categories);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({ page: 0, size: 10 });
  const [warningContent, setWarningContent] = useState<string | null>(null);
  const [messageInfo, setMessageInfo] = useState<{ type: 'success' | 'error'; content: string } | null>(null);

  useEffect(() => {
    dispatch(fetchCategories(searchParams));
  }, [dispatch, searchParams]);

  useEffect(() => {
    if (warningContent) {
      Modal.warning({ title: '无法删除分类', content: warningContent });
      setWarningContent(null);
    }
  }, [warningContent]);

  useEffect(() => {
    if (messageInfo) {
      message[messageInfo.type](messageInfo.content);
      setMessageInfo(null);
    }
  }, [messageInfo]);

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      setMessageInfo({ type: 'success', content: '删除成功' });
    } catch (err: any) {
      const data = err?.payload || err?.response?.data;
      const errorMessage = data?.message || err?.message || '删除失败';
      setWarningContent(errorMessage);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
      level: category.level,
      sortOrder: category.sortOrder,
      description: category.description,
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const processedValues = {
        name: values.name.trim(),
        slug: values.slug && values.slug.trim() ? values.slug.trim() : generateSlug(values.name),
        parentId: values.parentId || null,
        level: values.level || 1,
        sortOrder: values.sortOrder || 0,
        description: values.description ? values.description.trim() : null,
      };

      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory.id, data: processedValues as CategoryUpdateRequest })).unwrap();
        setMessageInfo({ type: 'success', content: '分类更新成功' });
      } else {
        await dispatch(createCategory(processedValues as CategoryCreateRequest)).unwrap();
        setMessageInfo({ type: 'success', content: '分类创建成功' });
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      setMessageInfo({ type: 'error', content: editingCategory ? '分类更新失败' : '分类创建失败' });
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handlePageChange = (page: number, size: number) => {
    setSearchParams({ page: page - 1, size });
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '别名',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: '父分类',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId: number) => {
        const parent = categories.find(cat => cat.id === parentId);
        return parent ? parent.name : '-';
      },
    },
    {
      title: '层级',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      align: 'center',
      render: (_, record: Category) => (
        <Space size="small" style={{ display: 'inline-flex' }}>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个分类吗？"
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>分类管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建分类
        </Button>
      </div>

      <Loading spinning={loading}>
        <Table columns={columns} dataSource={categories} rowKey="id" pagination={false} />
      </Loading>

      <Pagination current={pagination.number + 1} total={pagination.totalElements} pageSize={pagination.size} onChange={handlePageChange} />

      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical" initialValues={{ level: 1, sortOrder: 0 }}>
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item name="slug" label="别名" rules={[{ required: false }]}
          >
            <Input placeholder="留空将自动生成别名" />
          </Form.Item>

          <Form.Item name="parentId" label="父分类">
            <InputNumber placeholder="父分类ID（可选）" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="level" label="层级" rules={[{ required: true, message: '请输入层级' }]}
          >
            <InputNumber placeholder="层级" min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="sortOrder" label="排序" rules={[{ required: true, message: '请输入排序' }]}
          >
            <InputNumber placeholder="排序" min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入分类描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryList;
