import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subTitle?: string;
  breadcrumb?: Array<{
    title: string;
    path?: string;
  }>;
  extra?: React.ReactNode;
  onBack?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subTitle,
  breadcrumb,
  extra,
  onBack,
}) => {
  const navigate = useNavigate();

  const breadcrumbItems = breadcrumb?.map((item) => ({
    title: item.path ? (
      <a onClick={() => navigate(item.path!)}>{item.title}</a>
    ) : (
      item.title
    ),
  }));

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            {onBack && (
              <span onClick={onBack} style={{ cursor: 'pointer' }} title="返回">
                <HomeOutlined />
              </span>
            )}
            {title}
          </div>
          {subTitle && <div style={{ color: '#999' }}>{subTitle}</div>}
        </div>
        {extra}
      </div>
      <Breadcrumb
        items={[
          { title: <HomeOutlined onClick={() => navigate('/')} /> },
          ...(breadcrumbItems || []),
        ]}
        style={{ marginTop: 8 }}
      />
    </div>
  );
};

export default PageHeader;
