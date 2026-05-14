import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { FeatureProvider } from './contexts/FeatureContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserPreferencesProvider } from './contexts/UserPreferencesContext';
import { SiteConfigProvider } from './contexts/SiteConfigContext';
import { DomainProvider } from './contexts/DomainContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import MessageBoard from './pages/MessageBoard';
import ProjectDetail from './pages/ProjectDetail';
import PrivateRoute from './components/PrivateRoute';
import DynamicAdminRoute from './components/DynamicAdminRoute';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FeatureProvider>
          <AuthProvider>
            <UserPreferencesProvider>
              <SiteConfigProvider>
                <DomainProvider>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/messages" element={<MessageBoard />} />
                  <Route path="/project/:id" element={<ProjectDetail />} />
                  {/* 动态后台入口路由 - 支持自定义后台路径 */}
                  <Route path="/admin/*" element={<DynamicAdminRoute />} />
                  <Route path="/*" element={<DynamicAdminRoute />} />
                </Routes>
              </DomainProvider>
            </SiteConfigProvider>
            </UserPreferencesProvider>
          </AuthProvider>
        </FeatureProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
