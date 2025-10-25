// 枚举类型
export enum ContentType {
  MARKDOWN = 'MARKDOWN',
  HTML = 'HTML',
  RICH_TEXT = 'RICH_TEXT'
}

export enum PostStatus {
  DRAFT = 'DRAFT',        // 草稿：正在编辑，不可见
  PUBLISHED = 'PUBLISHED' // 已发布：可选择公开或密码保护
}

export enum Visibility {
  PUBLIC = 'PUBLIC',      // 公开：所有人可见
  PASSWORD = 'PASSWORD'   // 密码保护：需要密码才能查看
}

export enum LikeTargetType {
  POST = 'POST',
  COMMENT = 'COMMENT'
}

// 基础实体类型
export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  contentType: ContentType;
  status: PostStatus;
  visibility: Visibility;
  password?: string;
  categoryId?: number;
  coverImageUrl?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  level: number;
  sortOrder: number;
  description?: string;
  postCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color?: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

// 请求/响应类型
export interface PostCreateRequest {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  contentType?: ContentType;
  status?: PostStatus;
  visibility?: Visibility;
  password?: string;
  categoryId?: number;
  coverImageUrl?: string;
  tagIds?: number[];
}

export interface PostUpdateRequest {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  contentType?: ContentType;
  status?: PostStatus;
  visibility?: Visibility;
  password?: string;
  categoryId?: number;
  coverImageUrl?: string;
  tagIds?: number[];
}

export interface CategoryCreateRequest {
  name: string;
  slug?: string;
  parentId?: number;
  level?: number;
  sortOrder?: number;
  description?: string;
}

export interface CategoryUpdateRequest {
  name?: string;
  slug?: string;
  parentId?: number;
  level?: number;
  sortOrder?: number;
  description?: string;
}

export interface TagCreateRequest {
  name: string;
  slug?: string;
  color?: string;
}

export interface TagUpdateRequest {
  name?: string;
  slug?: string;
  color?: string;
}

// 分页类型
export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

// API响应类型
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// 路由类型
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  children?: RouteConfig[];
}

// 用户界面状态类型
export interface UIState {
  loading: boolean;
  error?: string;
}

// 表格分页参数
export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
}

// 搜索参数
export interface SearchParams {
  keyword?: string;
  categoryId?: number;
  tagId?: number;
}
