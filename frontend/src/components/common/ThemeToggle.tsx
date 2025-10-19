import React from 'react';
import { Button, Tooltip } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setTheme } from '@/store/slices/uiSlice';

interface ThemeToggleProps {
  size?: 'small' | 'middle' | 'large';
  type?: 'default' | 'text' | 'link' | 'primary' | 'dashed';
  showText?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'middle', 
  type = 'text',
  showText = false 
}) => {
  const dispatch = useDispatch();
  const { theme: currentTheme } = useSelector((state: RootState) => state.ui);
  
  const handleThemeToggle = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
    // 保存到本地存储
    localStorage.setItem('theme', newTheme);
  };

  const isDark = currentTheme === 'dark';
  const icon = isDark ? <SunOutlined /> : <MoonOutlined />;
  const tooltipTitle = isDark ? '切换到浅色模式' : '切换到深色模式';
  const buttonText = isDark ? '浅色' : '深色';

  return (
    <Tooltip title={tooltipTitle} placement="bottom">
      <Button
        type={type}
        size={size}
        icon={icon}
        onClick={handleThemeToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: showText ? '6px' : 0,
        }}
      >
        {showText && buttonText}
      </Button>
    </Tooltip>
  );
};

export default ThemeToggle;
