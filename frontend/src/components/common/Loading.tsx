import React from 'react';
import { Spin } from 'antd';

interface LoadingProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  spinning?: boolean;
  children?: React.ReactNode;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'default', 
  tip = '加载中...', 
  spinning = true,
  children 
}) => {
  if (children) {
    return (
      <Spin spinning={spinning} size={size} tip={tip}>
        {children}
      </Spin>
    );
  }

  return (
    <Spin size={size} tip={tip}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }} />
    </Spin>
  );
};

export default Loading;
