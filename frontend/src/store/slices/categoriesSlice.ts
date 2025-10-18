import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Category, CategoryCreateRequest, CategoryUpdateRequest, PageResult, PaginationParams } from '@/types';
import { apiService } from '@/services/api';

interface CategoriesState {
  categories: Category[];
  allCategories: Category[];
  currentCategory: Category | null;
  pagination: {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  allCategories: [],
  currentCategory: null,
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
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (params?: PaginationParams) => {
    const response = await apiService.getCategories(params);
    return response;
  }
);

export const fetchAllCategories = createAsyncThunk(
  'categories/fetchAllCategories',
  async () => {
    const response = await apiService.getAllCategories();
    return response;
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchCategoryById',
  async (id: number) => {
    const response = await apiService.getCategoryById(id);
    return response;
  }
);

export const fetchCategoryBySlug = createAsyncThunk(
  'categories/fetchCategoryBySlug',
  async (slug: string) => {
    const response = await apiService.getCategoryBySlug(slug);
    return response;
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (data: CategoryCreateRequest) => {
    const response = await apiService.createCategory(data);
    return response;
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, data }: { id: number; data: CategoryUpdateRequest }) => {
    const response = await apiService.updateCategory(id, data);
    return response;
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.deleteCategory(id);
      return id;
    } catch (error: any) {
      const data = error?.response?.data;
      return rejectWithValue(data || { message: error?.message || '删除分类失败' });
    }
  }
);

export const fetchCategoryChildren = createAsyncThunk(
  'categories/fetchCategoryChildren',
  async (parentId: number) => {
    const response = await apiService.getCategoryChildren(parentId);
    return response;
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
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
      // 获取分类列表
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.content;
        state.pagination = {
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          size: action.payload.size,
          number: action.payload.number,
        };
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取分类列表失败';
      })
      // 获取所有分类
      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.allCategories = action.payload;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取所有分类失败';
      })
      // 根据ID获取分类
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取分类详情失败';
      })
      // 根据别名获取分类
      .addCase(fetchCategoryBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取分类详情失败';
      })
      // 创建分类
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.unshift(action.payload);
        state.allCategories.unshift(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '创建分类失败';
      })
      // 更新分类
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(category => category.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        const allIndex = state.allCategories.findIndex(category => category.id === action.payload.id);
        if (allIndex !== -1) {
          state.allCategories[allIndex] = action.payload;
        }
        if (state.currentCategory?.id === action.payload.id) {
          state.currentCategory = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '更新分类失败';
      })
      // 删除分类
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(category => category.id !== action.payload);
        state.allCategories = state.allCategories.filter(category => category.id !== action.payload);
        if (state.currentCategory?.id === action.payload) {
          state.currentCategory = null;
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '删除分类失败';
      })
      // 获取子分类
      .addCase(fetchCategoryChildren.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryChildren.fulfilled, (state, action) => {
        state.loading = false;
        // 子分类可以单独存储或合并到现有列表中
      })
      .addCase(fetchCategoryChildren.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取子分类失败';
      });
  },
});

export const { clearCurrentCategory, clearError, setPagination } = categoriesSlice.actions;
export default categoriesSlice.reducer;
