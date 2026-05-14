import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaCog, FaHome, FaBlog, FaComments, FaMoon, FaSun, FaGlobe, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFeatures } from '../contexts/FeatureContext';

const NavStyled = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1rem 2rem;
  background: ${props => props.theme.navBg};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => props.theme.border};
  transition: all 0.3s ease;
`;

const NavContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
`;

const LogoSpan = styled.span`
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const LogoImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 900px) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: ${props => props.theme.textPrimary};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;

  @media (max-width: 900px) {
    display: block;
  }
`;

const MobileMenuContent = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.bgPrimary};
  z-index: 1000;
  padding: 80px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MobileNavLink = styled(Link)`
  color: ${props => props.theme.textPrimary};
  font-size: 1.2rem;
  padding: 15px;
  border-radius: 10px;
  background: ${props => props.theme.cardBg};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NavLink = styled(Link)`
  color: ${props => props.theme.textPrimary};
  font-weight: 500;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;

  &:hover {
    color: #00d4ff;
  }
`;

const IconButton = styled.button`
  background: ${props => props.theme.cardBg};
  border: 1px solid ${props => props.theme.border};
  color: ${props => props.theme.textPrimary};
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);
    color: #00d4ff;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  color: #000;
  padding: 0.5rem 1.2rem;
  border-radius: 25px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  font-size: 0.9rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: ${props => props.theme.textPrimary};
  position: relative;
`;

const UserDropdownTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.theme.cardBg};
  border: 1px solid ${props => props.theme.border};
  color: ${props => props.theme.textPrimary};
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);
  }

  svg {
    color: #00d4ff;
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: ${props => props.theme.cardBg};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  padding: 0.5rem;
  min-width: 180px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  backdrop-filter: blur(10px);
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: ${props => props.theme.textPrimary};
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: rgba(0, 212, 255, 0.1);
    color: #00d4ff;
  }

  svg {
    font-size: 1rem;
  }
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: ${props => props.theme.textPrimary};
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
  }

  svg {
    font-size: 1rem;
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: ${props => props.theme.border};
  margin: 0.5rem 0;
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: ${props => props.theme.border};
  margin: 0 0.5rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: ${props => props.theme.textPrimary};
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1001;
  padding: 10px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #00d4ff;
  }
`;

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { isFeatureEnabled } = useFeatures();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adminRoute, setAdminRoute] = useState('admin');
  const [siteTitle, setSiteTitle] = useState('MyPortfolio');
  const [siteLogo, setSiteLogo] = useState('');
  const dropdownRef = useRef(null);

  // 获取后台入口配置和首页配置
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [configRes, heroRes] = await Promise.all([
          axios.get('/api/config'),
          axios.get('/api/contents?type=hero').catch(() => ({ data: [] }))
        ]);
        
        setAdminRoute(configRes.data.admin_route || 'admin');
        
        // 解析 Hero 数据获取 siteTitle 和 siteLogo
        if (heroRes.data && heroRes.data.length > 0) {
          const hero = heroRes.data[0];
          if (hero.content) {
            try {
              const heroData = JSON.parse(hero.content);
              setSiteTitle(heroData.siteTitle || 'MyPortfolio');
              setSiteLogo(heroData.siteLogo || '');
            } catch (e) {
              console.error('解析 Hero 数据失败:', e);
            }
          }
        }
      } catch (error) {
        console.error('获取配置失败:', error);
      }
    };

    fetchConfig();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showBlog = isFeatureEnabled('blog');
  const showMessageBoard = isFeatureEnabled('messageBoard');
  const showThemeToggle = isFeatureEnabled('themeToggle');
  const showMultiLanguage = isFeatureEnabled('multiLanguage');

  return (
    <>
      <NavStyled
        as={motion.nav}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <NavContainer>
          <Logo to="/">
            {siteLogo && <LogoImage src={siteLogo} alt="logo" />}
            <LogoSpan>{siteTitle}</LogoSpan>
          </Logo>

          <NavLinks>
            <NavLink to="/">
              <FaHome /> {t('nav.home')}
            </NavLink>

            {showBlog && (
              <NavLink to="/blog">
                <FaBlog /> {t('nav.blog')}
              </NavLink>
            )}

            {showMessageBoard && (
              <NavLink to="/messages">
                <FaComments /> {t('nav.messages')}
              </NavLink>
            )}

            <Divider />

            {showThemeToggle && (
              <IconButton onClick={toggleTheme} title={t(`theme.${theme}`)} aria-label={t(`theme.${theme}`)}>
                {theme === 'dark' ? <FaSun /> : <FaMoon />}
              </IconButton>
            )}

            {showMultiLanguage && (
              <IconButton onClick={toggleLanguage} title={language === 'zh' ? '切换到英文' : 'Switch to Chinese'} aria-label={language === 'zh' ? '切换到英文' : 'Switch to Chinese'}>
                <FaGlobe />
              </IconButton>
            )}

            {user ? (
              <UserInfo ref={dropdownRef}>
                <UserDropdownTrigger onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <FaUser />
                  {user.username}
                  <FaChevronDown style={{ 
                    fontSize: '0.8rem', 
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }} />
                </UserDropdownTrigger>
                
                <AnimatePresence>
                  {dropdownOpen && (
                    <DropdownMenu
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isAdmin() && (
                        <DropdownItem to={`/${adminRoute}`} onClick={() => setDropdownOpen(false)}>
                          <FaCog /> {t('nav.admin')}
                        </DropdownItem>
                      )}
                      <DropdownDivider />
                      <DropdownButton onClick={handleLogout}>
                        <FaSignOutAlt /> {t('nav.logout')}
                      </DropdownButton>
                    </DropdownMenu>
                  )}
                </AnimatePresence>
              </UserInfo>
            ) : (
              <>
                <NavLink to="/login">{t('nav.login')}</NavLink>
                <NavLink to="/register">
                  <Button>{t('nav.register')}</Button>
                </NavLink>
              </>
            )}
          </NavLinks>

          <MobileMenuButton onClick={() => setMobileMenuOpen(true)} aria-label="打开菜单">
            <FaBars />
          </MobileMenuButton>
        </NavContainer>
      </NavStyled>

      {mobileMenuOpen && (
        <MobileMenuContent>
          <CloseButton type="button" onClick={() => setMobileMenuOpen(false)}>
            <FaTimes />
          </CloseButton>

          <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>
            <FaHome /> {t('nav.home')}
          </MobileNavLink>

          {showBlog && (
            <MobileNavLink to="/blog" onClick={() => setMobileMenuOpen(false)}>
              <FaBlog /> {t('nav.blog')}
            </MobileNavLink>
          )}

          {showMessageBoard && (
            <MobileNavLink to="/messages" onClick={() => setMobileMenuOpen(false)}>
              <FaComments /> {t('nav.messages')}
            </MobileNavLink>
          )}

          {user ? (
            <>
              {isAdmin() && (
                <MobileNavLink to={`/${adminRoute}`} onClick={() => setMobileMenuOpen(false)}>
                <FaCog /> {t('nav.admin')}
              </MobileNavLink>
              )}
              <MobileNavLink to="/" onClick={handleLogout}>
                <FaSignOutAlt /> {t('nav.logout')}
              </MobileNavLink>
            </>
          ) : (
            <>
              <MobileNavLink to="/login" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.login')}
              </MobileNavLink>
              <MobileNavLink to="/register" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.register')}
              </MobileNavLink>
            </>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {showThemeToggle && (
              <IconButton onClick={toggleTheme}>
                {theme === 'dark' ? <FaSun /> : <FaMoon />}
              </IconButton>
            )}
            {showMultiLanguage && (
              <IconButton onClick={toggleLanguage}>
                <FaGlobe />
              </IconButton>
            )}
          </div>
        </MobileMenuContent>
      )}
    </>
  );
};

export default Navbar;
