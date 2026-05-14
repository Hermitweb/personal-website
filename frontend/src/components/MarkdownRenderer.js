import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownContent = styled.div`
  color: ${props => props.theme?.textPrimary || '#fff'};
  line-height: 1.8;
  font-size: 1rem;

  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.theme?.textPrimary || '#fff'};
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    font-weight: 600;
    line-height: 1.3;
  }

  h1 { font-size: 2rem; }
  h2 { font-size: 1.75rem; }
  h3 { font-size: 1.5rem; }
  h4 { font-size: 1.25rem; }
  h5 { font-size: 1.1rem; }
  h6 { font-size: 1rem; }

  p {
    margin-bottom: 1rem;
  }

  a {
    color: #667eea;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #00d4ff;
      text-decoration: underline;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1rem 0;
  }

  code {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.9em;
    color: #e74c3c;
  }

  pre {
    background: rgba(0, 0, 0, 0.3);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1rem 0;

    code {
      background: transparent;
      padding: 0;
      color: #fff;
    }
  }

  blockquote {
    border-left: 4px solid #667eea;
    padding: 0.5rem 1rem;
    margin: 1rem 0;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 0 8px 8px 0;
    color: rgba(255, 255, 255, 0.8);
    font-style: italic;

    p:last-child {
      margin-bottom: 0;
    }
  }

  ul, ol {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.5rem;

    > ul, > ol {
      margin-top: 0.5rem;
    }
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    overflow: hidden;
    border-radius: 8px;

    th, td {
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.75rem;
      text-align: left;
    }

    th {
      background: rgba(102, 126, 234, 0.2);
      font-weight: 600;
    }

    tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.02);
    }
  }

  hr {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin: 2rem 0;
  }

  strong {
    font-weight: 600;
    color: #fff;
  }

  em {
    font-style: italic;
    color: rgba(255, 255, 255, 0.9);
  }

  del {
    text-decoration: line-through;
    color: rgba(255, 255, 255, 0.5);
  }

  /* 任务列表样式 */
  input[type="checkbox"] {
    margin-right: 0.5rem;
    accent-color: #667eea;
  }
`;

/**
 * Markdown 渲染组件
 * @param {string} content - Markdown 内容
 * @param {Object} theme - 主题对象（可选）
 */
const MarkdownRenderer = ({ content, theme }) => {
  if (!content) return null;

  return (
    <MarkdownContent theme={theme}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 自定义链接渲染，添加安全属性
          a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
          // 自定义图片渲染
          img: ({ src, alt, ...props }) => (
            <img 
              src={src} 
              alt={alt || ''} 
              loading="lazy"
              {...props} 
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </MarkdownContent>
  );
};

export default MarkdownRenderer;
