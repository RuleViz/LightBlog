/**
 * 生成文章别名
 * @param title 文章标题
 * @returns 别名
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/[\s_-]+/g, '-') // 将空格和下划线替换为连字符
    .replace(/^-+|-+$/g, ''); // 移除开头和结尾的连字符
};

/**
 * 截取文本
 * @param text 文本
 * @param length 长度
 * @param suffix 后缀
 * @returns 截取后的文本
 */
export const truncateText = (text: string, length: number, suffix: string = '...'): string => {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + suffix;
};

/**
 * 提取文本摘要
 * @param content 内容
 * @param length 长度
 * @returns 摘要
 */
export const extractExcerpt = (content: string, length: number = 150): string => {
  // 移除Markdown标记
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
    .replace(/`(.*?)`/g, '$1') // 移除行内代码标记
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接标记
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 移除图片标记
    .replace(/\n+/g, ' ') // 将换行符替换为空格
    .trim();

  return truncateText(plainText, length);
};

/**
 * 高亮搜索关键词
 * @param text 文本
 * @param keyword 关键词
 * @returns 高亮后的HTML
 */
export const highlightKeyword = (text: string, keyword: string): string => {
  if (!keyword.trim()) {
    return text;
  }
  
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * 验证邮箱格式
 * @param email 邮箱
 * @returns 是否有效
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证URL格式
 * @param url URL
 * @returns 是否有效
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
