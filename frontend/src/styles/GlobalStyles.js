import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
    overflow-x: hidden;
    transition: background 0.3s ease, color 0.3s ease;
  }

  :root {
    /* Dark theme (default) */
    --bg-primary: #0a0a0f;
    --bg-secondary: #12121a;
    --bg-tertiary: #1a1a25;
    --text-primary: #ffffff;
    --text-secondary: #a0a0a0;
    --accent: #00d4ff;
    --accent-hover: #00b8e6;
    --secondary: #7c3aed;
    --border: rgba(255, 255, 255, 0.1);
    --card-bg: rgba(255, 255, 255, 0.05);
    --success: #10b981;
    --warning: #f59e0b;
    --error: #ef4444;
  }

  [data-theme="light"] {
    --bg-primary: #f8fafc;
    --bg-secondary: #ffffff;
    --bg-tertiary: #f1f5f9;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --accent: #0066cc;
    --accent-hover: #0052a3;
    --secondary: #7c3aed;
    --border: rgba(0, 0, 0, 0.1);
    --card-bg: rgba(0, 0, 0, 0.02);
    --success: #059669;
    --warning: #d97706;
    --error: #dc2626;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--bg-primary);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .gradient-text {
    background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .glass {
    background: var(--card-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border);
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(0, 212, 255, 0.5); }
    50% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.8), 0 0 40px rgba(124, 58, 237, 0.5); }
  }

  /* Selection */
  ::selection {
    background: rgba(0, 212, 255, 0.3);
    color: var(--text-primary);
  }

  /* Focus styles */
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  /* Toast customization */
  .Toastify__toast {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border);
  }

  .Toastify__progress-bar {
    background: var(--accent);
  }
`;

export default GlobalStyles;
