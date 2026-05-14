import styled from 'styled-components';

// ============ 共享布局组件 ============

export const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
`;

export const Sidebar = styled.aside`
  width: 260px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

export const Logo = styled.div`
  padding: 0 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
  
  h1 {
    color: #fff;
    font-size: 1.3rem;
    font-weight: 700;
    background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    margin-top: 0.3rem;
  }
`;

export const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: ${props => props.active ? '#00d4ff' : 'rgba(255, 255, 255, 0.7)'};
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid ${props => props.active ? '#00d4ff' : 'transparent'};
  background: ${props => props.active ? 'rgba(0, 212, 255, 0.1)' : 'transparent'};
  
  &:hover {
    color: #00d4ff;
    background: rgba(0, 212, 255, 0.05);
  }
  
  svg {
    font-size: 1.1rem;
  }
`;

export const MainContent = styled.main`
  flex: 1;
  margin-left: 260px;
  padding: 2rem;
  min-height: 100vh;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

export const Title = styled.h1`
  color: #fff;
  font-size: 1.8rem;
  font-weight: 700;
`;

// ============ 卡片和表单组件 ============

export const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

export const Label = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #00d4ff;
  }
  
  option {
    background: #1a1a2e;
    color: #fff;
  }
`;

export const Description = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  margin-top: 0.35rem;
`;

export const SectionTitle = styled.h3`
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

// ============ 按钮组件 ============

export const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  color: #000;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 212, 255, 0.3);
  }
`;

export const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export const DangerButton = styled(Button)`
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  border: 1px solid #e74c3c;
  
  &:hover:not(:disabled) {
    background: #e74c3c;
    color: #fff;
  }
`;

export const SaveButton = styled(PrimaryButton)``;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

// ============ 表格组件 ============

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  th {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
  }
  
  td {
    color: #fff;
  }
  
  tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

// ============ 徽章组件 ============

export const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch(props.type) {
      case 'success': return 'rgba(46, 204, 113, 0.2)';
      case 'warning': return 'rgba(241, 196, 15, 0.2)';
      case 'danger': return 'rgba(231, 76, 60, 0.2)';
      case 'info': return 'rgba(52, 152, 219, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'success': return '#2ecc71';
      case 'warning': return '#f1c40f';
      case 'danger': return '#e74c3c';
      case 'info': return '#3498db';
      default: return '#fff';
    }
  }};
`;

// ============ 开关组件 ============

export const Toggle = styled.button`
  width: 50px;
  height: 26px;
  border-radius: 13px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  background: ${props => props.active ? '#00d4ff' : 'rgba(255, 255, 255, 0.2)'};
  
  &::after {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    top: 2px;
    left: ${props => props.active ? '26px' : '2px'};
    transition: all 0.3s ease;
  }
`;

// ============ 模态框组件 ============

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 2rem;
  width: 90%;
  max-width: ${props => props.maxWidth || '500px'};
  max-height: 90vh;
  overflow-y: auto;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    color: #fff;
    font-size: 1.3rem;
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
  
  &:hover {
    color: #fff;
  }
`;

// ============ 统计卡片组件 ============

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

export const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  
  h3 {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #fff;
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

// ============ 空状态组件 ============

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
  
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  p {
    font-size: 1rem;
  }
`;

// ============ 加载状态组件 ============

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #00d4ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// ============ 分页组件 ============

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

export const PageButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.active ? 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  border-radius: 8px;
  color: ${props => props.active ? '#000' : '#fff'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)' : 'rgba(255, 255, 255, 0.2)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ============ 头像相关组件 ============

export const AvatarPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(102, 126, 234, 0.3);
  }
`;

export const AvatarPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.5);
`;

export const AvatarUploadButton = styled.label`
  padding: 0.5rem 1rem;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid #667eea;
  border-radius: 10px;
  color: #667eea;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.3);
  }
`;

// ============ 密码相关组件 ============

export const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
  opacity: 0.6;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 1;
  }
`;

export const PasswordStrengthBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

export const PasswordStrengthFill = styled.div`
  height: 100%;
  width: ${props => (props.strength / 4) * 100}%;
  border-radius: 2px;
  background: ${props => {
    switch(props.strength) {
      case 1: return '#e74c3c';
      case 2: return '#e67e22';
      case 3: return '#f1c40f';
      case 4: return '#2ecc71';
      default: return 'transparent';
    }
  }};
  transition: all 0.3s ease;
`;

export const PasswordStrengthText = styled.div`
  font-size: 0.8rem;
  margin-top: 0.35rem;
  color: rgba(255, 255, 255, 0.5);
`;

// ============ 搜索框组件 ============

export const SearchInput = styled(Input)`
  padding-left: 2.5rem;
`;

export const SearchWrapper = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.4);
  }
`;
