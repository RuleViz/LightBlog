import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import { message } from 'antd';
import './MarkdownEditor.css';

// Markdown 编辑器组件的属性类型定义
type MarkdownEditorProps = {
  value?: string; // 编辑器的值
  onChange?: (value: string) => void; // 值变化时的回调函数
  placeholder?: string; // 占位符文本
  height?: number | string; // 编辑器高度
  className?: string; // 自定义样式类名
};

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value = '',
  onChange,
  placeholder = '请输入内容（支持 Markdown 输入规则：#、>、``` 等）',
  height = 420,
  className,
}) => {
  // 全屏模式状态
  const [isFullscreen, setIsFullscreen] = useState(false);
  // 文件上传输入框引用
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 上传状态
  const [uploading, setUploading] = useState(false);

  // 创建代码高亮实例（用于代码块）
  const lowlight = useMemo(() => createLowlight(common), []);

  // 配置编辑器扩展
  const extensions = useMemo(() => [
    StarterKit.configure({
      codeBlock: false, // 使用带语法高亮的代码块替代
    }),
    Placeholder.configure({ placeholder }),
    Link.configure({ openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto'] }),
    Image.configure({
      inline: true,
      allowBase64: false,
      HTMLAttributes: {
        class: 'editor-image',
      },
    }),
    CodeBlockLowlight.configure({ lowlight }),
    Markdown.configure({
      html: false,
      tightLists: true,
      tightListClass: 'tight',
      bulletListMarker: '-',
      linkify: true,
      breaks: false,
      transformPastedText: true,
      transformCopiedText: true,
    }),
  ], [placeholder]);

  // 初始化编辑器
  const editor = useEditor({
    extensions,
    autofocus: 'end',
    onUpdate: ({ editor }) => {
      const md = (editor.storage as any).markdown?.getMarkdown?.() as string | undefined;
      if (typeof md === 'string') {
        onChange?.(md);
      }
    },
  });

  // 当外部 value 变化时更新编辑器内容
  useEffect(() => {
    if (!editor) return;
    const current = (editor.storage as any).markdown?.getMarkdown?.() as string | undefined;
    if ((value || '') !== (current || '')) {
      editor.commands.setContent(value || '');
    }
  }, [editor, value]);

  // 处理快捷键（ESC 退出全屏，F11 切换全屏）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC 键退出全屏
      if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        setIsFullscreen(false);
      }
      // F11 键切换全屏（阻止浏览器默认全屏行为）
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // 全屏时防止页面滚动
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // 切换全屏模式
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // 处理图片上传
  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;

    // 验证文件类型
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return;
    }

    // 验证文件大小（5MB）
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const data = await response.json();
      if (data && data.url) {
        const fullUrl = data.url;
        
        // 在光标位置插入图片
        editor.chain().focus().setImage({ src: fullUrl }).run();
        message.success('图片上传成功！');
      } else {
        throw new Error('响应数据格式错误');
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      message.error('图片上传失败，请重试');
    } finally {
      setUploading(false);
    }
  }, [editor]);

  // 触发文件选择
  const handleImageButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 处理文件选择
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // 清空 input 值，以便可以重复上传同一文件
    e.target.value = '';
  }, [handleImageUpload]);

  // 执行编辑器命令的辅助函数
  const run = useCallback((fn: (chain: any) => any) => {
    if (!editor) return;
    fn(editor.chain().focus()).run();
  }, [editor]);

  // 检查当前格式是否激活
  const isActive = useCallback((name: string, attrs?: Record<string, any>) => {
    return editor ? editor.isActive(name as any, attrs) : false;
  }, [editor]);

  // 工具栏按钮样式
  const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    minWidth: '36px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // 激活状态的按钮样式
  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#1890ff',
    color: '#fff',
    borderColor: '#1890ff',
  };

  // 分隔线样式
  const dividerStyle = {
    width: '1px',
    height: '24px',
    backgroundColor: '#d9d9d9',
    margin: '0 4px',
  };

  return (
    <div className={`${className || ''} ${isFullscreen ? 'markdown-editor-fullscreen' : ''}`}>
      {/* 隐藏的文件输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      
      {/* 工具栏 */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '6px', 
        marginBottom: '12px',
        padding: '12px',
        backgroundColor: '#fafafa',
        borderRadius: '4px',
        border: '1px solid #e8e8e8',
      }}>
        {/* 文本格式组 */}
        <button 
          type="button" 
          onClick={() => run(c => c.toggleBold())} 
          disabled={!editor} 
          style={isActive('bold') ? activeButtonStyle : buttonStyle}
          title="粗体 (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button 
          type="button" 
          onClick={() => run(c => c.toggleItalic())} 
          disabled={!editor} 
          style={isActive('italic') ? activeButtonStyle : buttonStyle}
          title="斜体 (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button 
          type="button" 
          onClick={() => run(c => c.toggleStrike())} 
          disabled={!editor} 
          style={isActive('strike') ? activeButtonStyle : buttonStyle}
          title="删除线"
        >
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </button>
        <button 
          type="button" 
          onClick={() => run(c => c.toggleCode())} 
          disabled={!editor} 
          style={isActive('code') ? activeButtonStyle : buttonStyle}
          title="行内代码"
        >
          <code>{'</>'}</code>
        </button>

        {/* 分隔线 */}
        <div style={dividerStyle} />

        {/* 标题组 */}
        <button 
          type="button" 
          onClick={() => run(c => c.toggleHeading({ level: 1 }))} 
          style={isActive('heading', { level: 1 }) ? activeButtonStyle : buttonStyle}
          title="一级标题"
        >
          H1
        </button>
        <button 
          type="button" 
          onClick={() => run(c => c.toggleHeading({ level: 2 }))} 
          style={isActive('heading', { level: 2 }) ? activeButtonStyle : buttonStyle}
          title="二级标题"
        >
          H2
        </button>
        <button 
          type="button" 
          onClick={() => run(c => c.toggleHeading({ level: 3 }))} 
          style={isActive('heading', { level: 3 }) ? activeButtonStyle : buttonStyle}
          title="三级标题"
        >
          H3
        </button>

        {/* 分隔线 */}
        <div style={dividerStyle} />

        {/* 区块格式组 */}
        <button 
          type="button" 
          onClick={() => run(c => c.toggleBlockquote())} 
          style={isActive('blockquote') ? activeButtonStyle : buttonStyle}
          title="引用块"
        >
          ❝❞
        </button>
        <button 
          type="button" 
          onClick={() => run(c => c.toggleBulletList())} 
          style={isActive('bulletList') ? activeButtonStyle : buttonStyle}
          title="无序列表"
        >
          • 列表
        </button>
        <button 
          type="button" 
          onClick={() => run(c => c.toggleOrderedList())} 
          style={isActive('orderedList') ? activeButtonStyle : buttonStyle}
          title="有序列表"
        >
          1. 列表
        </button>
        <button 
          type="button" 
          onClick={() => run(c => c.toggleCodeBlock())} 
          style={isActive('codeBlock') ? activeButtonStyle : buttonStyle}
          title="代码块"
        >
          代码块
        </button>

        {/* 分隔线 */}
        <div style={dividerStyle} />

        {/* 链接组 */}
        <button
          type="button"
          onClick={() => {
            if (!editor) return;
            const prev = editor.getAttributes('link')?.href as string | undefined;
            const url = window.prompt('请输入链接地址：', prev || 'https://');
            if (url === null) return;
            if (url === '') {
              run(c => c.unsetLink());
              return;
            }
            run(c => c.extendMarkRange('link').setLink({ href: url, target: '_blank' }));
          }}
          style={isActive('link') ? activeButtonStyle : buttonStyle}
          title="插入链接"
        >
          🔗 链接
        </button>
        <button 
          type="button" 
          onClick={() => run(c => c.unsetLink())}
          style={buttonStyle}
          title="移除链接"
        >
          🔗✗
        </button>

        {/* 分隔线 */}
        <div style={dividerStyle} />

        {/* 图片组 */}
        <button
          type="button"
          onClick={handleImageButtonClick}
          disabled={!editor || uploading}
          style={{
            ...buttonStyle,
            opacity: uploading ? 0.5 : 1,
          }}
          title="插入图片"
        >
          {uploading ? '⏳ 上传中...' : '🖼️ 图片'}
        </button>

        {/* 分隔线 */}
        <div style={dividerStyle} />

        {/* 撤销重做组 */}
        <button 
          type="button" 
          onClick={() => editor?.chain().focus().undo().run()} 
          disabled={!editor?.can().undo()}
          style={buttonStyle}
          title="撤销 (Ctrl+Z)"
        >
          ↶ 撤销
        </button>
        <button 
          type="button" 
          onClick={() => editor?.chain().focus().redo().run()} 
          disabled={!editor?.can().redo()}
          style={buttonStyle}
          title="重做 (Ctrl+Y)"
        >
          ↷ 重做
        </button>

        {/* 分隔线 */}
        <div style={dividerStyle} />

        {/* 全屏按钮 */}
        <button 
          type="button" 
          onClick={toggleFullscreen}
          style={isFullscreen ? activeButtonStyle : buttonStyle}
          title={isFullscreen ? "退出全屏 (ESC)" : "全屏编辑 (F11)"}
        >
          {isFullscreen ? '🗗 退出' : '🗖 全屏'}
        </button>
      </div>

      {/* 编辑器内容区域 */}
      <div 
        className="markdown-editor-content"
        style={{ 
          border: '1px solid #d9d9d9', 
          borderRadius: '4px', 
          padding: '0', // 移除外层padding，在ProseMirror内部设置
          minHeight: isFullscreen ? 'calc(100vh - 80px)' : height, 
          maxHeight: isFullscreen ? 'calc(100vh - 80px)' : '60vh', 
          overflowY: 'auto',
          backgroundColor: '#fff',
          fontSize: '14px',
          lineHeight: '1.6',
          transition: 'all 0.2s', // 添加过渡效果
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* 全屏提示 */}
      {isFullscreen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          color: '#fff',
          borderRadius: '6px',
          fontSize: '13px',
          zIndex: 10000,
          animation: 'fadeInOut 4s ease-in-out',
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}>
          💡 专注模式已开启 | 按 ESC 或 F11 退出
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;


