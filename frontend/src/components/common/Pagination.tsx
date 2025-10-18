import React from 'react';
import { Pagination as AntPagination } from 'antd';

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, size: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  pageSizeOptions?: string[];
  disabled?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  current,
  total,
  pageSize,
  onChange,
  showSizeChanger = true,
  showQuickJumper = true,
  showTotal = true,
  pageSizeOptions = ['10', '20', '50', '100'],
  disabled = false,
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      marginTop: '24px' 
    }}>
      <AntPagination
        current={current}
        total={total}
        pageSize={pageSize}
        onChange={onChange}
        onShowSizeChange={onChange}
        showSizeChanger={showSizeChanger}
        showQuickJumper={showQuickJumper}
        showTotal={showTotal ? (total, range) => 
          `第 ${range[0]}-${range[1]} 条/共 ${total} 条` 
          : undefined}
        pageSizeOptions={pageSizeOptions}
        disabled={disabled}
      />
    </div>
  );
};

export default Pagination;
