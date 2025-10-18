import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Tag, TagCreateRequest, TagUpdateRequest, PageResult, PaginationParams } from '@/types';
import { apiService } from '@/services/api';

interface TagsState {
  tags: Tag[];
  allTags: Tag[];
  currentTag: Tag | null;
  pagination: {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: TagsState = {
  tags: [],
  allTags: [],
  currentTag: null,
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
export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async (params?: PaginationParams) => {
    const response = await apiService.getTags(params);
    return response;
  }
);

export const fetchAllTags = createAsyncThunk(
  'tags/fetchAllTags',
  async () => {
    const response = await apiService.getAllTags();
    return response;
  }
);

export const fetchTagById = createAsyncThunk(
  'tags/fetchTagById',
  async (id: number) => {
    const response = await apiService.getTagById(id);
    return response;
  }
);

export const fetchTagBySlug = createAsyncThunk(
  'tags/fetchTagBySlug',
  async (slug: string) => {
    const response = await apiService.getTagBySlug(slug);
    return response;
  }
);

export const createTag = createAsyncThunk(
  'tags/createTag',
  async (data: TagCreateRequest) => {
    const response = await apiService.createTag(data);
    return response;
  }
);

export const updateTag = createAsyncThunk(
  'tags/updateTag',
  async ({ id, data }: { id: number; data: TagUpdateRequest }) => {
    const response = await apiService.updateTag(id, data);
    return response;
  }
);

export const deleteTag = createAsyncThunk(
  'tags/deleteTag',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.deleteTag(id);
      return id;
    } catch (error: any) {
      const data = error?.response?.data;
      return rejectWithValue(data || { message: error?.message || '删除标签失败' });
    }
  }
);

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearCurrentTag: (state) => {
      state.currentTag = null;
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
      // 获取标签列表
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload.content;
        state.pagination = {
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          size: action.payload.size,
          number: action.payload.number,
        };
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取标签列表失败';
      })
      // 获取所有标签
      .addCase(fetchAllTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTags.fulfilled, (state, action) => {
        state.loading = false;
        state.allTags = action.payload;
      })
      .addCase(fetchAllTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取所有标签失败';
      })
      // 根据ID获取标签
      .addCase(fetchTagById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTagById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTag = action.payload;
      })
      .addCase(fetchTagById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取标签详情失败';
      })
      // 根据别名获取标签
      .addCase(fetchTagBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTagBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTag = action.payload;
      })
      .addCase(fetchTagBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取标签详情失败';
      })
      // 创建标签
      .addCase(createTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.loading = false;
        state.tags.unshift(action.payload);
        state.allTags.unshift(action.payload);
      })
      .addCase(createTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '创建标签失败';
      })
      // 更新标签
      .addCase(updateTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tags.findIndex(tag => tag.id === action.payload.id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
        const allIndex = state.allTags.findIndex(tag => tag.id === action.payload.id);
        if (allIndex !== -1) {
          state.allTags[allIndex] = action.payload;
        }
        if (state.currentTag?.id === action.payload.id) {
          state.currentTag = action.payload;
        }
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '更新标签失败';
      })
      // 删除标签
      .addCase(deleteTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = state.tags.filter(tag => tag.id !== action.payload);
        state.allTags = state.allTags.filter(tag => tag.id !== action.payload);
        if (state.currentTag?.id === action.payload) {
          state.currentTag = null;
        }
      })
      .addCase(deleteTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '删除标签失败';
      });
  },
});

export const { clearCurrentTag, clearError, setPagination } = tagsSlice.actions;
export default tagsSlice.reducer;
