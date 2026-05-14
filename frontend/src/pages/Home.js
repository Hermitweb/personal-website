import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useFeatures } from '../contexts/FeatureContext';
import ParticleBackground from '../components/ParticleBackground';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Bookmarks from '../components/Bookmarks';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import BackToTop from '../components/BackToTop';
import SectionRenderer from '../components/SectionRenderer';

const HomeWrapper = styled.div`
  background: ${props => props.theme.bgPrimary};
  min-height: 100vh;
`;

const LoadingWrapper = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.bgPrimary};
  color: ${props => props.theme.textPrimary};
`;

const Home = () => {
  const { isFeatureEnabled } = useFeatures();
  const showBookmarks = isFeatureEnabled('bookmarks');
  const [contents, setContents] = useState({
    hero: null,
    about: null,
    skills: null,
    projects: null,
    bookmarks: null,
    contact: null
  });
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useSections, setUseSections] = useState(false);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 尝试获取板块数据
      const sectionsRes = await axios.get('/api/sections', { headers }).catch(() => ({ data: [] }));
      
      // 如果有板块数据，使用新的板块渲染方式
      if (sectionsRes.data && sectionsRes.data.length > 0) {
        setSections(sectionsRes.data);
        setUseSections(true);
        
        // 仍然需要获取 hero 和 contact 数据
        const [heroRes, contactRes] = await Promise.all([
          axios.get('/api/contents?type=hero', { headers }).catch(() => ({ data: [] })),
          axios.get('/api/contents?type=contact', { headers }).catch(() => ({ data: [] }))
        ]);
        
        setContents(prev => ({
          ...prev,
          hero: heroRes.data[0] || null,
          contact: contactRes.data
        }));
      } else {
        // 回退到旧的内容获取方式
        const [heroRes, aboutRes, skillsRes, projectsRes, bookmarksRes, contactRes] = await Promise.all([
          axios.get('/api/contents?type=hero', { headers }).catch(() => ({ data: [] })),
          axios.get('/api/contents?type=about', { headers }).catch(() => ({ data: [] })),
          axios.get('/api/contents?type=skill', { headers }).catch(() => ({ data: [] })),
          axios.get('/api/contents?type=project', { headers }).catch(() => ({ data: [] })),
          axios.get('/api/contents?type=bookmark', { headers }).catch(() => ({ data: [] })),
          axios.get('/api/contents?type=contact', { headers }).catch(() => ({ data: [] }))
        ]);

        setContents({
          hero: heroRes.data[0] || null,
          about: aboutRes.data[0] || null,
          skills: skillsRes.data,
          projects: projectsRes.data,
          bookmarks: bookmarksRes.data,
          contact: contactRes.data
        });
        setUseSections(false);
      }
    } catch (error) {
      console.error('获取内容失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingWrapper>加载中...</LoadingWrapper>;
  }

  // 过滤出需要渲染的板块（排除内置的 skills, projects, bookmarks，它们由旧组件处理）
  const customSections = sections.filter(s => 
    s.sectionType === 'custom' || 
    !['skills', 'projects', 'bookmarks'].includes(s.slug)
  );

  // 检查是否有内置板块配置
  const builtinSkills = sections.find(s => s.slug === 'skills' && s.sectionType === 'builtin');
  const builtinProjects = sections.find(s => s.slug === 'projects' && s.sectionType === 'builtin');
  const builtinBookmarks = sections.find(s => s.slug === 'bookmarks' && s.sectionType === 'builtin');

  return (
    <HomeWrapper>
      <ParticleBackground />
      <Navbar />
      <main>
        <Hero heroData={contents.hero} />
        
        {useSections ? (
          <>
            {/* 技能板块 */}
            {builtinSkills ? (
              <SectionRenderer section={builtinSkills} />
            ) : (
              <Skills skillsData={contents.skills} />
            )}
            
            {/* 项目板块 */}
            {builtinProjects ? (
              <SectionRenderer section={builtinProjects} />
            ) : (
              <Projects projectsData={contents.projects} />
            )}
            
            {/* 站点收藏板块 */}
            {showBookmarks && (
              builtinBookmarks ? (
                <SectionRenderer section={builtinBookmarks} />
              ) : (
                <Bookmarks bookmarksData={contents.bookmarks} />
              )
            )}
            
            {/* 自定义板块 */}
            {customSections.map(section => (
              <SectionRenderer key={section.id} section={section} />
            ))}
          </>
        ) : (
          <>
            {/* 旧的渲染方式 */}
            <Skills skillsData={contents.skills} />
            <Projects projectsData={contents.projects} />
            {showBookmarks && <Bookmarks bookmarksData={contents.bookmarks} />}
          </>
        )}
        
        <Contact contactData={contents.contact} />
      </main>
      <Footer />
      <BackToTop />
    </HomeWrapper>
  );
};

export default Home;
