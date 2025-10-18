import React, { useEffect, useState, useMemo } from 'react';
import { Empty, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchPosts, fetchPostsByCategory, fetchPostsByTag } from '@/store/slices/postsSlice';
import { Post, SearchParams, PaginationParams } from '@/types';
import PostListItem from './PostListItem';
import Pagination from '@/components/common/Pagination';

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Empty 
        description="暂无文章" 
        style={{ margin: '50px 0' }}
      />
    );
  }

  return (
    <div className="post-list-container">
      {posts.map((post: Post) => (
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
