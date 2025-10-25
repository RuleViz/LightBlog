import React, { useState } from 'react';
import { Collapse, Typography, Spin, Tooltip } from 'antd';
import { GithubOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ContributionData {
  date: string;
  count: number;
  level: number;
}

interface GitHubContributionsProps {
  className?: string;
}

const GitHubContributions: React.FC<GitHubContributionsProps> = ({ className }) => {
  const [loading, setLoading] = useState(false);
  const [contributions, setContributions] = useState<ContributionData[]>([]);
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [hasLoaded, setHasLoaded] = useState(false); // 追踪是否已加载过数据

  // 处理折叠面板展开/折叠
  const handleCollapseChange = (keys: string | string[]) => {
    const isExpanded = Array.isArray(keys) ? keys.length > 0 : !!keys;
    // 只在首次展开且未加载过数据时才请求
    if (isExpanded && !hasLoaded) {
      fetchContributions();
    }
  };

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/github/contributions');
      const result = await response.json();
      
      if (result.success) {
        setContributions(result.data || []);
        setUsername(result.username || '');
        setError('');
        setHasLoaded(true); // 标记已加载
      } else {
        setError(result.error || '获取GitHub贡献数据失败');
        setHasLoaded(true); // 即使失败也标记已加载，避免重复请求
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('获取GitHub贡献数据失败:', err);
      setHasLoaded(true); // 即使失败也标记已加载
    } finally {
      setLoading(false);
    }
  };

  const getColorByLevel = (level: number): string => {
    const colors = [
      '#ebedf0', // level 0 - 无贡献
      '#9be9a8', // level 1 - 低贡献
      '#40c463', // level 2 - 中贡献
      '#30a14e', // level 3 - 高贡献
      '#216e39'  // level 4 - 很高贡献
    ];
    return colors[Math.min(level, 4)] || colors[0];
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTooltipTitle = (item: ContributionData): string => {
    const dateStr = formatDate(item.date);
    const countText = item.count === 0 ? '无贡献' : `${item.count} 次贡献`;
    return `${dateStr}: ${countText}`;
  };

  // 将贡献数据按周分组
  const groupByWeeks = (data: ContributionData[]) => {
    const weeks: ContributionData[][] = [];
    let currentWeek: ContributionData[] = [];
    
    data.forEach((item, index) => {
      const date = new Date(item.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      
      if (index === 0) {
        // 填充第一周开始前的空白天数
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({ date: '', count: 0, level: 0 });
        }
      }
      
      currentWeek.push(item);
      
      if (dayOfWeek === 6 || index === data.length - 1) {
        // 周六或最后一天，结束当前周
        if (index === data.length - 1 && dayOfWeek < 6) {
          // 填充最后一周结束后的空白天数
          for (let i = dayOfWeek + 1; i <= 6; i++) {
            currentWeek.push({ date: '', count: 0, level: 0 });
          }
        }
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    return weeks;
  };

  const renderContributionGrid = () => {
    if (contributions.length === 0) return null;

    const weeks = groupByWeeks(contributions);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* 可滚动的贡献图容器 */}
        <div style={{ 
          overflowX: 'auto', 
          overflowY: 'hidden',
          paddingBottom: '8px',
          // 自定义滚动条样式
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db #f3f4f6'
        }}
        // Webkit浏览器滚动条样式
        className="github-contributions-scroll"
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            minWidth: `${weeks.length * 14 + 40}px` // 动态计算最小宽度
          }}>
            {/* 月份标签 */}
            <div style={{ display: 'flex', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              <div style={{ width: '20px', flexShrink: 0 }}></div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-around',
                minWidth: `${weeks.length * 14}px`
              }}>
                {['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'].map((month, index) => (
                  <span key={index} style={{ fontSize: '10px' }}>{month}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2px' }}>
              {/* 星期标签 */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '2px', 
                marginRight: '4px',
                flexShrink: 0
              }}>
                {weekdays.map((day, index) => (
                  <div
                    key={index}
                    style={{
                      width: '12px',
                      height: '12px',
                      fontSize: '10px',
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {index % 2 === 1 ? day : ''}
                  </div>
                ))}
              </div>

              {/* 贡献网格 */}
              <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {week.map((day, dayIndex) => (
                      <Tooltip
                        key={`${weekIndex}-${dayIndex}`}
                        title={day.date ? getTooltipTitle(day) : ''}
                        placement="top"
                      >
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: day.date ? getColorByLevel(day.level) : 'transparent',
                            borderRadius: '2px',
                            cursor: day.date ? 'pointer' : 'default',
                            border: day.date ? '1px solid #e1e4e8' : 'none'
                          }}
                        />
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 图例 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '8px' }}>
          <Text style={{ fontSize: '12px', color: '#666' }}>少</Text>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: getColorByLevel(level),
                borderRadius: '2px',
                border: '1px solid #e1e4e8'
              }}
            />
          ))}
          <Text style={{ fontSize: '12px', color: '#666' }}>多</Text>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin />
          <div style={{ marginTop: '8px', color: '#666' }}>加载GitHub贡献数据...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          <GithubOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
          <div>{error}</div>
        </div>
      );
    }

    return (
      <>
        <style>
          {`
            .github-contributions-scroll::-webkit-scrollbar {
              height: 6px;
            }
            .github-contributions-scroll::-webkit-scrollbar-track {
              background: #f1f3f4;
              border-radius: 3px;
            }
            .github-contributions-scroll::-webkit-scrollbar-thumb {
              background: #d1d5db;
              border-radius: 3px;
            }
            .github-contributions-scroll::-webkit-scrollbar-thumb:hover {
              background: #9ca3af;
            }
          `}
        </style>
        {username && (
          <div style={{ marginBottom: '16px' }}>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              @{username} 的贡献活动
            </Text>
          </div>
        )}
        
        {renderContributionGrid()}
      </>
    );
  };

  return (
    <Collapse
      className={className}
      onChange={handleCollapseChange}
      items={[
        {
          key: 'github-contributions',
          label: (
            <span style={{ fontWeight: 500 }}>
              <GithubOutlined style={{ marginRight: 8 }} />
              GitHub 贡献
            </span>
          ),
          children: renderContent()
        }
      ]}
    />
  );
};

export default GitHubContributions;
