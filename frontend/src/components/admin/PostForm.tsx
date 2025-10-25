import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Card, Row, Col, Space, App } from 'antd';
import { SaveOutlined, EyeOutlined, RobotOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { createPost, updatePost, fetchAdminPostById } from '@/store/slices/postsSlice';
import { fetchAllCategories } from '@/store/slices/categoriesSlice';
import { fetchAllTags } from '@/store/slices/tagsSlice';
import { PostCreateRequest, PostUpdateRequest, PostStatus, Visibility, ContentType } from '@/types';
import Loading from '@/components/common/Loading';
import MarkdownEditor from '@/components/common/MarkdownEditor';
import AIDialog from '@/components/common/AIDialog';
import AIService from '@/services/ai';
import { apiService } from '@/services/api';
import ImageUpload from '@/components/common/ImageUpload';

const { Option } = Select;
const { TextArea } = Input;

const PostForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { message } = App.useApp();
  const isEdit = Boolean(id);
  
  const { currentPost, loading } = useSelector((state: RootState) => state.posts);
  const { allCategories } = useSelector((state: RootState) => state.categories);
  const { allTags } = useSelector((state: RootState) => state.tags);

  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [aiDialogVisible, setAiDialogVisible] = useState(false);
  const [aiService] = useState(() => new AIService());

  useEffect(() => {
    dispatch(fetchAllCategories());
    dispatch(fetchAllTags());
    
    if (isEdit && id) {
      dispatch(fetchAdminPostById(Number(id)));
    }
  }, [dispatch, isEdit, id]);

  useEffect(() => {
    if (isEdit && currentPost) {
      form.setFieldsValue({
        title: currentPost.title,
        slug: currentPost.slug,
        excerpt: currentPost.excerpt,
        content: currentPost.content,
        contentType: currentPost.contentType,
        status: currentPost.status,
        visibility: currentPost.visibility,
        password: currentPost.password,
        categoryId: currentPost.categoryId,
        coverImageUrl: currentPost.coverImageUrl,
        tagIds: currentPost.tags?.map(t => t.id) || [],
      });
    }
  }, [isEdit, currentPost, form]);

  const handleSubmit = async (values: PostCreateRequest | PostUpdateRequest) => {
    setSaving(true);
    try {
      if (isEdit && id) {
        await dispatch(updatePost({ id: Number(id), data: values as PostUpdateRequest })).unwrap();
        message.success('文章更新成功');
      } else {
        await dispatch(createPost(values as PostCreateRequest)).unwrap();
        message.success('文章创建成功');
      }
      navigate('/admin/posts');
    } catch (error) {
      message.error(isEdit ? '文章更新失败' : '文章创建失败');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const values = form.getFieldsValue();
    if (values.title && values.content) {
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(`
          <html>
            <head>
              <title>${values.title}</title>
              <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                h1 { color: #333; }
                .content { line-height: 1.6; }
              </style>
            </head>
            <body>
              <h1>${values.title}</h1>
              <div class="content">${values.content}</div>
            </body>
          </html>
        `);
      }
    } else {
      message.warning('请先填写标题和内容');
    }
  };

  // 处理AI对话框
  const handleAIDialog = () => {
    const values = form.getFieldsValue();
    if (values.content) {
      setAiDialogVisible(true);
    } else {
      message.warning('请先输入文章内容');
    }
  };

  // 处理AI结果
  const handleAIResult = (result: string) => {
    const values = form.getFieldsValue();
    form.setFieldsValue({
      ...values,
      content: result
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2>{isEdit ? '编辑文章' : '新建文章'}</h2>
          <Space>
            <Button
              icon={<RobotOutlined />}
              onClick={handleAIDialog}
              type="default"
            >
              AI助手
            </Button>
            <Button
              icon={<EyeOutlined />}
              onClick={handlePreview}
            >
              预览
            </Button>
          </Space>
        </div>

        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              contentType: ContentType.MARKDOWN,
              status: PostStatus.DRAFT,
              visibility: Visibility.PUBLIC,
              tagIds: [],
            }}
          >
            {/* 封面图片上传 - 置于顶部 */}
            <Form.Item
              name="coverImageUrl"
              label={<span style={{ fontSize: '16px', fontWeight: 500 }}>封面图片</span>}
            >
              <ImageUpload />
            </Form.Item>

            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="title"
                  label="标题"
                  rules={[{ required: true, message: '请输入文章标题' }]}
                >
                  <Input placeholder="请输入文章标题" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="slug"
                  label="别名"
                  rules={[{ required: true, message: '请输入文章别名' }]}
                >
                  <Input placeholder="请输入文章别名" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="excerpt"
              label="摘要"
            >
              <TextArea
                rows={3}
                placeholder="请输入文章摘要（可选）"
              />
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.contentType !== curr.contentType}>
              {() => {
                const ct = form.getFieldValue('contentType');
                return (
                  <Form.Item
                    name="content"
                    label="内容"
                    rules={[{ required: true, message: '请输入文章内容' }]}
                  >
                    {ct === ContentType.MARKDOWN ? (
                      <MarkdownEditor />
                    ) : (
                      <TextArea
                        rows={20}
                        placeholder="请输入文章内容"
                      />
                    )}
                  </Form.Item>
                );
              }}
            </Form.Item>

            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  name="contentType"
                  label="内容类型"
                  rules={[{ required: true, message: '请选择内容类型' }]}
                >
                  <Select>
                    <Option value={ContentType.MARKDOWN}>Markdown</Option>
                    <Option value={ContentType.HTML}>HTML</Option>
                    <Option value={ContentType.RICH_TEXT}>富文本</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="status"
                  label="状态"
                  rules={[{ required: true, message: '请选择文章状态' }]}
                >
                  <Select>
                    <Option value={PostStatus.DRAFT}>草稿</Option>
                    <Option value={PostStatus.PUBLISHED}>已发布</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.status !== curr.status}>
                  {() => {
                    const status = form.getFieldValue('status');
                    // 只有已发布状态才显示可见性选项
                    if (status === PostStatus.PUBLISHED) {
                      return (
                        <Form.Item
                          name="visibility"
                          label="可见性"
                          rules={[{ required: true, message: '请选择可见性' }]}
                        >
                          <Select onChange={(v) => {
                            if (v !== Visibility.PASSWORD) {
                              form.setFieldsValue({ password: undefined });
                            }
                          }}>
                            <Option value={Visibility.PUBLIC}>公开</Option>
                            <Option value={Visibility.PASSWORD}>密码保护</Option>
                          </Select>
                        </Form.Item>
                      );
                    }
                    return <div style={{ height: 32 }}></div>; // 占位
                  }}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="categoryId"
                  label="分类"
                >
                  <Select placeholder="请选择分类" allowClear>
                    {allCategories.map(category => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="tagIds" label="标签">
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder="请选择标签"
                    optionFilterProp="label"
                    maxTagCount="responsive"
                  >
                    {allTags.map(tag => (
                      <Option key={tag.id} value={tag.id} label={tag.name}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: 10,
                              height: 10,
                              backgroundColor: tag.color || '#1677ff',
                              borderRadius: '50%'
                            }}
                          />
                          {tag.name}
                        </span>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.visibility !== curr.visibility}>
              {() => {
                const v = form.getFieldValue('visibility');
                if (v === Visibility.PASSWORD) {
                  return (
                    <Form.Item
                      name="password"
                      label="访问密码"
                      rules={[{ required: true, message: '密码保护文章需要填写访问密码' }]}
                    >
                      <Input placeholder="密码保护文章的访问密码" />
                    </Form.Item>
                  );
                }
                return null;
              }}
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={saving}
                >
                  {isEdit ? '更新' : '创建'}
                </Button>
                <Button onClick={() => navigate('/admin/posts')}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>

      <AIDialog
        visible={aiDialogVisible}
        onClose={() => setAiDialogVisible(false)}
        content={form?.getFieldValue('content') || ''}
        onResult={handleAIResult}
        aiService={aiService}
      />
    </>
  );
};

export default PostForm;
