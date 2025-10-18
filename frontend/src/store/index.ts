import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './slices/postsSlice';
import categoriesReducer from './slices/categoriesSlice';
import tagsReducer from './slices/tagsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    categories: categoriesReducer,
    tags: tagsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
