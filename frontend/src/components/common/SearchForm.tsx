import React from 'react';
import { Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;

interface SearchFormProps {
  onSearch: (keyword: string) => void;
  loading?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  loading = false,
  placeholder = "请输入搜索关键词",
  value,
  onChange,
}) => {
  const handleSearch = (searchValue: string) => {
    onSearch(searchValue);
  };

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Search
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onSearch={handleSearch}
        enterButton={<SearchOutlined />}
        loading={loading}
        size="large"
        allowClear
      />
    </Space.Compact>
  );
};

export default SearchForm;
