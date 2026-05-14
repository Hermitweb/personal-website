import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

const EditorWrapper = styled.div`
  .EasyMDEContainer {
    .CodeMirror {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #fff;
      font-size: 14px;
      line-height: 1.6;
      
      .cm-header {
        color: #00d4ff;
      }
      
      .cm-link {
        color: #667eea;
      }
      
      .cm-url {
        color: #7c3aed;
      }
      
      .cm-quote {
        color: rgba(255, 255, 255, 0.6);
        font-style: italic;
      }
      
      .cm-strong {
        font-weight: bold;
        color: #fff;
      }
      
      .cm-em {
        font-style: italic;
        color: rgba(255, 255, 255, 0.8);
      }
      
      .cm-comment {
        color: rgba(255, 255, 255, 0.4);
      }
      
      .cm-variable-2 {
        color: rgba(255, 255, 255, 0.7);
      }
      
      .cm-tag {
        color: #e74c3c;
      }
      
      .cm-attribute {
        color: #f1c40f;
      }
      
      .cm-hr {
        color: rgba(255, 255, 255, 0.3);
      }
      
      .cm-formatting {
        color: rgba(255, 255, 255, 0.4);
      }
      
      .CodeMirror-cursor {
        border-left-color: #fff;
      }
      
      .CodeMirror-selected {
        background: rgba(102, 126, 234, 0.3) !important;
      }
      
      .CodeMirror-gutters {
        background: rgba(255, 255, 255, 0.02);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .CodeMirror-linenumber {
        color: rgba(255, 255, 255, 0.3);
      }
    }
    
    .editor-toolbar {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-bottom: none;
      border-radius: 10px 10px 0 0;
      
      a {
        color: rgba(255, 255, 255, 0.7);
        border: none;
        
        &:hover, &:active {
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
        }
        
        &.active {
          background: rgba(102, 126, 234, 0.3);
          color: #667eea;
        }
        
        &.disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      }
      
      &:before, &:after {
        display: none;
      }
      
      i.separator {
        border-left-color: rgba(255, 255, 255, 0.1);
        border-right-color: rgba(255, 255, 255, 0.1);
      }
    }
    
    .editor-preview {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #fff;
      padding: 1rem;
      
      h1, h2, h3, h4, h5, h6 {
        color: #fff;
        margin-top: 1rem;
        margin-bottom: 0.5rem;
      }
      
      p {
        margin-bottom: 1rem;
        line-height: 1.6;
      }
      
      code {
        background: rgba(255, 255, 255, 0.1);
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-family: 'Fira Code', monospace;
      }
      
      pre {
        background: rgba(0, 0, 0, 0.3);
        padding: 1rem;
        border-radius: 8px;
        overflow-x: auto;
        
        code {
          background: transparent;
          padding: 0;
        }
      }
      
      blockquote {
        border-left: 4px solid #667eea;
        padding-left: 1rem;
        margin: 1rem 0;
        color: rgba(255, 255, 255, 0.7);
        font-style: italic;
      }
      
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 1rem 0;
        
        th, td {
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.5rem;
        }
        
        th {
          background: rgba(255, 255, 255, 0.05);
        }
      }
      
      img {
        max-width: 100%;
        border-radius: 8px;
      }
      
      a {
        color: #667eea;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
      
      ul, ol {
        margin-bottom: 1rem;
        padding-left: 1.5rem;
      }
      
      li {
        margin-bottom: 0.25rem;
      }
      
      hr {
        border: none;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin: 1.5rem 0;
      }
    }
    
    .editor-statusbar {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-top: none;
      border-radius: 0 0 10px 10px;
      color: rgba(255, 255, 255, 0.5);
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }
  }
`;

/**
 * Markdown 编辑器组件
 * @param {string} value - 编辑器内容
 * @param {function} onChange - 内容变化回调
 * @param {string} placeholder - 占位符
 * @param {boolean} preview - 是否显示预览按钮
 * @param {string} height - 编辑器高度
 */
const MarkdownEditor = ({ 
  value, 
  onChange, 
  placeholder = '在此输入 Markdown 内容...',
  preview = true,
  height = 300
}) => {
  const handleChange = useCallback((value) => {
    onChange(value);
  }, [onChange]);

  const options = useMemo(() => {
    return {
      spellChecker: false,
      placeholder,
      autofocus: false,
      autosave: {
        enabled: false,
      },
      status: ['autosave', 'lines', 'words'],
      toolbar: [
        'bold', 'italic', 'heading', '|',
        'quote', 'unordered-list', 'ordered-list', '|',
        'link', 'image', 'table', '|',
        'code', 'horizontal-rule', '|',
        preview ? 'preview' : undefined,
        'side-by-side', 'fullscreen', '|',
        'guide'
      ].filter(Boolean),
      minHeight: `${height}px`,
      maxHeight: '600px',
      renderingConfig: {
        singleLineBreaks: false,
        codeSyntaxHighlighting: false,
      },
      shortcuts: {
        drawTable: 'Cmd-Alt-T'
      }
    };
  }, [placeholder, preview, height]);

  return (
    <EditorWrapper>
      <SimpleMDE
        value={value}
        onChange={handleChange}
        options={options}
      />
    </EditorWrapper>
  );
};

export default MarkdownEditor;
