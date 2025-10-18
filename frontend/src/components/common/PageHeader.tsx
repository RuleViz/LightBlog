import React from 'react';
import { PageHeader as AntPageHeader, Breadcrumb } from 'antd';
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

  const breadcrumbItems = breadcrumb?.map((item, index) => ({
    title: item.path ? (
      <a onClick={() => navigate(item.path!)}>{item.title}</a>
    ) : (
      item.title
    ),
  }));

  return (
    <AntPageHeader
      title={title}
      subTitle={subTitle}
      onBack={onBack}
      extra={extra}
      breadcrumb={{
        items: [
          {
            title: <HomeOutlined />,
            path: '/',
          },
          ...(breadcrumbItems || []),
        ],
      }}
    />
  );
};

export default PageHeader;
