import React, { useState } from 'react';
import { Upload, Image, App } from 'antd';
import { PlusOutlined, LoadingOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import './ImageUpload.css';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange }) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(value || '');

  // 图片上传前验证
  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }

    const isJpgOrPngOrWebp = 
      file.type === 'image/jpeg' || 
      file.type === 'image/png' || 
      file.type === 'image/webp' ||
      file.type === 'image/gif';
    if (!isJpgOrPngOrWebp) {
      message.error('只支持 JPG、PNG、WEBP、GIF 格式的图片！');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！');
      return false;
    }

    return true;
  };

  // 处理上传变化
  const handleChange = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setLoading(false);
      const response = info.file.response;
      if (response && response.url) {
        const fullUrl = response.url;
        setImageUrl(fullUrl);
        onChange?.(fullUrl);
        message.success('图片上传成功！');
      }
    }
    if (info.file.status === 'error') {
      setLoading(false);
      message.error('图片上传失败！');
    }
  };

  // 删除图片
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageUrl('');
    onChange?.('');
    message.success('已移除封面图片');
  };

  const uploadButton = (
    <div className="upload-button-content">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>
        {loading ? '上传中...' : '点击上传封面'}
      </div>
    </div>
  );

  return (
    <div className="image-upload-wrapper">
      <Upload
        name="file"
        listType="picture-card"
        className="cover-image-uploader"
        showUploadList={false}
        action="/api/upload/image"
        beforeUpload={beforeUpload}
        onChange={handleChange}
      >
        {imageUrl ? (
          <div className="uploaded-image-container">
            <Image
              src={imageUrl}
              alt="封面图片"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              preview={true}
            />
            <div className="image-actions-overlay">
              <DeleteOutlined 
                className="delete-icon" 
                onClick={handleDelete}
              />
            </div>
          </div>
        ) : (
          uploadButton
        )}
      </Upload>
      <div className="upload-hint">
        <p>支持格式：JPG、PNG、WEBP、GIF</p>
        <p>文件大小：最大 5MB</p>
        <p>建议尺寸：1200x630 像素（适合社交媒体分享）</p>
      </div>
    </div>
  );
};

export default ImageUpload;

