import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  Post, 
  PostCreateRequest, 
  PostUpdateRequest, 
  Category, 
  CategoryCreateRequest, 
  CategoryUpdateRequest,
  Tag,
  TagCreateRequest,
  TagUpdateRequest,
  PageResult,
  PaginationParams,
  SearchParams,
  LikeTargetType
} from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.api.interceptors.request.use(
      (config) => {
        // 可以在这里添加认证token
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // 文章相关API
  async getPosts(params?: PaginationParams & SearchParams): Promise<PageResult<Post>> {
    const response = await this.api.get('/posts', { params });
    return response.data;
  }

  // 管理端文章API（包含所有状态）
  async getAdminPosts(params?: PaginationParams & SearchParams): Promise<PageResult<Post>> {
    const response = await this.api.get('/posts/admin', { params });
    return response.data;
  }

  // 获取文章统计信息
  async getPostStats(): Promise<{ totalPosts: number; publishedPosts: number; draftPosts: number }> {
    const response = await this.api.get('/posts/stats');
    return response.data;
  }

  async getPostById(id: number): Promise<Post> {
    const response = await this.api.get(`/posts/${id}`);
    return response.data;
  }

  async getPostBySlug(slug: string): Promise<Post> {
    const response = await this.api.get(`/posts/slug/${slug}`);
    return response.data;
  }

  async verifyPostPasswordBySlug(slug: string, password: string): Promise<void> {
    await this.api.post(`/posts/slug/${slug}/access`, password, {
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      withCredentials: true,
    });
  }

  async createPost(data: PostCreateRequest): Promise<Post> {
    const response = await this.api.post('/posts', data);
    return response.data;
  }

  async updatePost(id: number, data: PostUpdateRequest): Promise<Post> {
    const response = await this.api.put(`/posts/${id}`, data);
    return response.data;
  }

  async verifyPostPasswordById(postId: number, password: string): Promise<void> {
    await this.api.post(`/posts/${postId}/access`, password, {
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      withCredentials: true,
    });
  }

  async deletePost(id: number): Promise<void> {
    await this.api.delete(`/posts/${id}`);
  }

  async getPostsByCategory(categoryId: number, params?: PaginationParams): Promise<PageResult<Post>> {
    const response = await this.api.get(`/posts/category/${categoryId}`, { params });
    return response.data;
  }

  async getPostsByTag(tagId: number, params?: PaginationParams): Promise<PageResult<Post>> {
    const response = await this.api.get(`/posts/tag/${tagId}`, { params });
    return response.data;
  }

  // 分类相关API
  async getCategories(params?: PaginationParams): Promise<PageResult<Category>> {
    const response = await this.api.get('/categories', { params });
    return response.data;
  }

  async getAllCategories(): Promise<Category[]> {
    const response = await this.api.get('/categories/all');
    return response.data;
  }

  async getCategoryById(id: number): Promise<Category> {
    const response = await this.api.get(`/categories/${id}`);
    return response.data;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await this.api.get(`/categories/slug/${slug}`);
    return response.data;
  }

  async createCategory(data: CategoryCreateRequest): Promise<Category> {
    const response = await this.api.post('/categories', data);
    return response.data;
  }

  async updateCategory(id: number, data: CategoryUpdateRequest): Promise<Category> {
    const response = await this.api.put(`/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await this.api.delete(`/categories/${id}`);
  }

  async getCategoryChildren(parentId: number): Promise<Category[]> {
    const response = await this.api.get(`/categories/${parentId}/children`);
    return response.data;
  }

  async checkCategoryNameExists(name: string): Promise<boolean> {
    const response = await this.api.get(`/categories/exists/name/${name}`);
    return response.data;
  }

  async checkCategorySlugExists(slug: string): Promise<boolean> {
    const response = await this.api.get(`/categories/exists/slug/${slug}`);
    return response.data;
  }

  // 标签相关API
  async getTags(params?: PaginationParams): Promise<PageResult<Tag>> {
    const response = await this.api.get('/tags', { params });
    return response.data;
  }

  async getAllTags(): Promise<Tag[]> {
    const response = await this.api.get('/tags/all');
    return response.data;
  }

  async getTagById(id: number): Promise<Tag> {
    const response = await this.api.get(`/tags/${id}`);
    return response.data;
  }

  async getTagBySlug(slug: string): Promise<Tag> {
    const response = await this.api.get(`/tags/slug/${slug}`);
    return response.data;
  }

  async createTag(data: TagCreateRequest): Promise<Tag> {
    const response = await this.api.post('/tags', data);
    return response.data;
  }

  async updateTag(id: number, data: TagUpdateRequest): Promise<Tag> {
    const response = await this.api.put(`/tags/${id}`, data);
    return response.data;
  }

  async deleteTag(id: number): Promise<void> {
    await this.api.delete(`/tags/${id}`);
  }

  async checkTagNameExists(name: string): Promise<boolean> {
    const response = await this.api.get(`/tags/exists/name/${name}`);
    return response.data;
  }

  async checkTagSlugExists(slug: string): Promise<boolean> {
    const response = await this.api.get(`/tags/exists/slug/${slug}`);
    return response.data;
  }

  // 点赞相关API
  async likePost(targetType: LikeTargetType, targetId: number): Promise<void> {
    await this.api.post(`/likes/${targetType}/${targetId}`);
  }

  async unlikePost(targetType: LikeTargetType, targetId: number): Promise<void> {
    await this.api.delete(`/likes/${targetType}/${targetId}`);
  }

  async getLikeCount(targetType: LikeTargetType, targetId: number): Promise<number> {
    const response = await this.api.get(`/likes/${targetType}/${targetId}/count`);
    return response.data;
  }

  async isLiked(targetType: LikeTargetType, targetId: number): Promise<boolean> {
    const response = await this.api.get(`/likes/${targetType}/${targetId}/status`);
    return response.data;
  }
}

export const apiService = new ApiService();
