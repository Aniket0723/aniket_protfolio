import React from "react";
import styled from "styled-components/macro";
import NavLink from "./NavLink";
import { navLinks } from "./navLinks";
import { m, domAnimation, LazyMotion } from "framer-motion";
import MoonSvg from "../assets/MoonSvg";
import SunSvg from "../assets/SunSvg";

const StyledNavbar = styled.nav`
  background-color: ${(props) => props.theme.navbar.body};
  width: 100%;
  position: sticky;
  z-index: 10000;
  top: 0;
  padding: 1rem 0;
  border-bottom: 1px solid ${(props) => props.theme.navbar.border};
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
`;

const NavContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
`;

const StyledName = styled.div`
  font-weight: 800;
  font-size: 1.5rem;
  color: ${(props) => props.theme.text};
  cursor: pointer;

  span {
    color: ${(props) => props.theme.secondaryText};
  }
`;

const StyledLinks = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const StyledIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ThemeButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.text};
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const HamburgerBtn = styled.div`
  display: none;
  cursor: pointer;
  color: ${(props) => props.theme.text};

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
`;

const MobileMenu = styled(m.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  background: ${(props) => props.theme.body};
  z-index: 10001;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
`;

const CloseButton = styled.div`
  position: absolute;
  top: 2rem;
  right: 2rem;
  cursor: pointer;
  color: ${(props) => props.theme.text};
  font-size: 1.5rem;
`;

const Navbar = ({ isOpen, setIsOpen, theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === "lightTheme" ? "darkTheme" : "lightTheme");
  };

  return (
    <StyledNavbar>
      <NavContainer>
        <StyledName
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ANIKET<span>.</span>
        </StyledName>

        <StyledLinks>
          {navLinks.map(({ navLinkId, scrollToId }, idx) => (
            <NavLink key={idx} navLinkId={navLinkId} scrollToId={scrollToId} />
          ))}
        </StyledLinks>

        <StyledIcons>
          <ThemeButton onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "lightTheme" ? <MoonSvg /> : <SunSvg />}
          </ThemeButton>
        </StyledIcons>

        <HamburgerBtn id="hamburger">
          <ThemeButton onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "lightTheme" ? <MoonSvg /> : <SunSvg />}
          </ThemeButton>
          <LazyMotion features={domAnimation}>
            <m.div onClick={() => setIsOpen(true)}>
              <img
                src={
                  theme === "darkTheme"
                    ? "images/hamburgerDark.png"
                    : "images/hamburgerLight.png"
                }
                alt="menu"
                width="24"
              />
            </m.div>
          </LazyMotion>
        </HamburgerBtn>
      </NavContainer>

      {isOpen && (
        <LazyMotion features={domAnimation}>
          <MobileMenu
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
          >
            <CloseButton onClick={() => setIsOpen(false)}>×</CloseButton>
            {navLinks.map(({ navLinkId, scrollToId }, idx) => (
              <div key={idx} onClick={() => setIsOpen(false)}>
                <NavLink navLinkId={navLinkId} scrollToId={scrollToId} />
              </div>
            ))}
          </MobileMenu>
        </LazyMotion>
      )}
    </StyledNavbar>
  );
};

export default Navbar;
