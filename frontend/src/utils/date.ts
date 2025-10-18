import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

export const formatDateShort = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD');
};

export const formatRelativeTime = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

export const isToday = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isYesterday = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
};
