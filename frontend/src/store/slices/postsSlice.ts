import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post, PostCreateRequest, PostUpdateRequest, PaginationParams, SearchParams } from '@/types';
import { apiService } from '@/services/api';

interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  pagination: {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  currentPost: null,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
  },
  loading: false,
  error: null,
};

// 异步操作
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (params?: PaginationParams & SearchParams) => {
    const response = await apiService.getPosts(params);
    return response;
  }
);

export const fetchAdminPosts = createAsyncThunk(
  'posts/fetchAdminPosts',
  async (params?: PaginationParams & SearchParams) => {
    const response = await apiService.getAdminPosts(params);
    return response;
  }
);

export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (id: number) => {
    const response = await apiService.getPostById(id);
    return response;
  }
);

export const fetchPostBySlug = createAsyncThunk(
  'posts/fetchPostBySlug',
  async (slug: string) => {
    const response = await apiService.getPostBySlug(slug);
    return response;
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (data: PostCreateRequest) => {
    const response = await apiService.createPost(data);
    return response;
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, data }: { id: number; data: PostUpdateRequest }) => {
    const response = await apiService.updatePost(id, data);
    return response;
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id: number) => {
    await apiService.deletePost(id);
    return id;
  }
);

export const fetchPostsByCategory = createAsyncThunk(
  'posts/fetchPostsByCategory',
  async ({ categoryId, params }: { categoryId: number; params?: PaginationParams }) => {
    const response = await apiService.getPostsByCategory(categoryId, params);
    return { categoryId, response };
  }
);

export const fetchPostsByTag = createAsyncThunk(
  'posts/fetchPostsByTag',
  async ({ tagId, params }: { tagId: number; params?: PaginationParams }) => {
    const response = await apiService.getPostsByTag(tagId, params);
    return { tagId, response };
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPagination: (state, action: PayloadAction<{ page: number; size: number }>) => {
      state.pagination.number = action.payload.page;
      state.pagination.size = action.payload.size;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取文章列表
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.content;
        state.pagination = {
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          size: action.payload.size,
          number: action.payload.number,
        };
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取文章列表失败';
      })
      // 获取管理端文章列表
      .addCase(fetchAdminPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.content;
        state.pagination = {
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          size: action.payload.size,
          number: action.payload.number,
        };
      })
      .addCase(fetchAdminPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取管理端文章列表失败';
      })
      // 根据ID获取文章
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取文章详情失败';
      })
      // 根据别名获取文章
      .addCase(fetchPostBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取文章详情失败';
      })
      // 创建文章
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '创建文章失败';
      })
      // 更新文章
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.posts.findIndex(post => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost = action.payload;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '更新文章失败';
      })
      // 删除文章
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter(post => post.id !== action.payload);
        if (state.currentPost?.id === action.payload) {
          state.currentPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '删除文章失败';
      })
      // 根据分类获取文章
      .addCase(fetchPostsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.response.content;
        state.pagination = {
          totalElements: action.payload.response.totalElements,
          totalPages: action.payload.response.totalPages,
          size: action.payload.response.size,
          number: action.payload.response.number,
        };
      })
      .addCase(fetchPostsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取分类文章失败';
      })
      // 根据标签获取文章
      .addCase(fetchPostsByTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostsByTag.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.response.content;
        state.pagination = {
          totalElements: action.payload.response.totalElements,
          totalPages: action.payload.response.totalPages,
          size: action.payload.response.size,
          number: action.payload.response.number,
        };
      })
      .addCase(fetchPostsByTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取标签文章失败';
      });
  },
});

export const { clearCurrentPost, clearError, setPagination } = postsSlice.actions;
export default postsSlice.reducer;
