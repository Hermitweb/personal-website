import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaArrowUp } from 'react-icons/fa';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(20px); }
`;

const Button = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
  z-index: 999;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  ${props => props.$visible
    ? css`animation: ${fadeIn} 0.3s ease forwards;`
    : css`animation: ${fadeOut} 0.3s ease forwards; pointer-events: none;`
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(0, 212, 255, 0.5);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Button $visible={visible} onClick={scrollToTop} title="回到顶部">
      <FaArrowUp />
    </Button>
  );
};

export default BackToTop;
