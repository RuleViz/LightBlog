import React, { useEffect, useState, useMemo } from 'react';
import { Empty, Spin, Segmented } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchPosts, fetchPostsByCategory, fetchPostsByTag } from '@/store/slices/postsSlice';
import { Post, SearchParams, PaginationParams } from '@/types';
import PostListItem from './PostListItem';
import Pagination from '@/components/common/Pagination';

type SortMode = 'updated' | 'created';

const SORT_OPTIONS: { label: string; value: SortMode }[] = [
  { label: '按更新时间', value: 'updated' },
  { label: '按创建时间', value: 'created' },
];

interface PostListProps {
  searchParams?: SearchParams;
  showExcerpt?: boolean;
}

const PostList: React.FC<PostListProps> = ({ 
  searchParams = {}, 
  showExcerpt = true 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, pagination, loading } = useSelector((state: RootState) => state.posts);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortMode, setSortMode] = useState<SortMode>('updated');

  // 使用 useMemo 稳定搜索参数字段，避免父组件传入新对象导致的重复请求
  const stableSearchParams = useMemo(() => ({
    keyword: searchParams.keyword,
    categoryId: searchParams.categoryId,
    tagId: searchParams.tagId,
  }), [searchParams.keyword, searchParams.categoryId, searchParams.tagId]);

  const { keyword, categoryId, tagId } = stableSearchParams;

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, categoryId, tagId]);

  useEffect(() => {
    const base: PaginationParams = { page: currentPage - 1, size: pageSize };

    if (typeof tagId === 'number') {
      dispatch(fetchPostsByTag({ tagId, params: base }));
      return;
    }

    if (typeof categoryId === 'number') {
      dispatch(fetchPostsByCategory({ categoryId, params: base }));
      return;
    }

    const params: PaginationParams & SearchParams = {
      ...base,
      ...(keyword ? { keyword } : {}),
    };

    dispatch(fetchPosts(params));
  }, [dispatch, currentPage, pageSize, keyword, categoryId, tagId]);

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const sortedPosts = useMemo(() => {
    const parseTime = (value?: string) => (value ? new Date(value).getTime() : 0);
    const getUpdatedTime = (post: Post) => parseTime(post.updatedAt ?? post.publishedAt ?? post.createdAt);
    const getCreatedTime = (post: Post) => parseTime(post.publishedAt ?? post.createdAt);
    const getPinnedPriority = (post: Post) => {
      const pinnedTime = parseTime(post.pinnedAt);
      const updatedTime = getUpdatedTime(post);
      return Math.max(pinnedTime, updatedTime);
    };

    const comparator = (a: Post, b: Post) => {
      if (a.pinned && b.pinned) {
        const pinnedDiff = getPinnedPriority(b) - getPinnedPriority(a);
        if (pinnedDiff !== 0) {
          return pinnedDiff;
        }
      }

      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }

      const primaryA = sortMode === 'updated' ? getUpdatedTime(a) : getCreatedTime(a);
      const primaryB = sortMode === 'updated' ? getUpdatedTime(b) : getCreatedTime(b);
      if (primaryA !== primaryB) {
        return primaryB - primaryA;
      }

      const updatedDiff = getUpdatedTime(b) - getUpdatedTime(a);
      if (updatedDiff !== 0) {
        return updatedDiff;
      }

      return getCreatedTime(b) - getCreatedTime(a);
    };

    return [...posts].sort(comparator);
  }, [posts, sortMode]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (sortedPosts.length === 0) {
    return (
      <Empty 
        description="暂无文章" 
        style={{ margin: '50px 0' }}
      />
    );
  }

  return (
    <div className="post-list-container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Segmented
          size="middle"
          value={sortMode}
          onChange={(val) => setSortMode(val as SortMode)}
          options={SORT_OPTIONS}
        />
      </div>
      {sortedPosts.map((post: Post) => (
        <PostListItem 
          key={post.id}
          post={post} 
          showExcerpt={showExcerpt} 
        />
      ))}

      {pagination.totalPages > 1 && (
        <div style={{ marginTop: '32px' }}>
          <Pagination
            current={currentPage}
            total={pagination.totalElements}
            pageSize={pageSize}
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default PostList;
