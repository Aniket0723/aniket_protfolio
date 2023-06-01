import React from 'react'
import styled from 'styled-components/macro'
import NavLink from './NavLink'
import { navLinks } from './navLinks'
import { m, domAnimation, LazyMotion } from 'framer-motion'
import MoonSvg from '../assets/MoonSvg'
import SunSvg from '../assets/SunSvg'

const StyledNavbar = styled.nav`
  background-color: ${(props) => props.theme.navbar.body};
  width: 100%;
  position: sticky;
  z-index: 10000;
  top: 0;
  padding: 1.2em 0;
  color: ${(props) => props.theme.navbar.text};
  max-height: 40px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: rgba(67, 71, 85, 0.27) 0px 0px 0.25em,
    rgba(90, 125, 188, 0.05) 0px 0.25em 1em;
  transition: ${(props) => props.theme.themeTransition.transition};
`
const StyledName = styled.span`
  transition: all 1.5s linear;
  img {
    width: 250px; height: 49px; display: block; 
    
  }
`
const StyledLinks = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`
const StyledIcons = styled.span`
  & > * {
    font-size: 34px;
    margin: 0 0.8rem;
    max-width: 250px;
    cursor: pointer;
    align-self: center;
    transition: all 0.2s ease-in-out;

    &:hover {
      color: ${(props) => props.theme.navbar.text};
      transition: all 0.2s ease-in-out;
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      display: none;
    }
    @media (max-width: 1000px) {
      margin: 0 0.4rem;
    }
  }
`
const StyledA = styled.a`
  /* color: ${(props) => props.theme.navbar.text}; */
  img {
    height: 34px;
    width: 34px;
    &:hover {
      transform: scale(1.1);
      transition: all 0.2s ease-in-out;
    }
  }
`

const Button = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  @media (max-width: 770px) {
    font-size: 24px;
  }
`
const HamburgerBtn = styled.i`
  font-size: 24px;
  display: none;
  /* color: red; */
  cursor: pointer;
  @media (max-width: 768px) {
    display: block;
  }
`
const StyledMobileMenu = styled.div`
  position: fixed;
  top: 75px;
  /* border: 2px solid red; */
  right: 0;
  height: 50vh;
  width: 100%;
  z-index: 99;
  display: flex;
  border-radius: 0 0 20px 20px;
  background-color: #f7f7f7;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  box-shadow: rgba(17, 17, 26, 0.1) 0px 4px 16px,
    rgba(17, 17, 26, 0.05) 0px 8px 32px;
  /* @media screen and (min-width: 768px) {
    width: 100%;
  } */

  user-select: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`
const StyledMobileLink = styled.div`
  color: #0e1111;
  letter-spacing: 1.2px;
  font-weight: 600;
  &:hover {
    color: black;
    transform: scale(1.1);
    transition: all 0.2s ease-in-out;
  }
`
const SocialMediaWrapper = styled.div`
  border: 1px solid black; 
  display: flex;
  border-radius: 5px;
  align-items: center;
  cursor: pointer;
  justify-content: space-around;
  width: 220px;
  font-size: 34px;
  color: #3b444b;
  padding-top: 2px;
  min-height: 40px;
  box-shadow: rgba(0, 0, 0, 0.09) 0px 3px 12px;

  a {
    color: #3b444b;
  }
  i:hover {
    color: black;
    transform: scale(1.1);
    transition: all 0.2s ease-in-out;
  }
`

const Navbar = ({ isOpen, setIsOpen, theme, setTheme }) => {
  const toggleTheme = () => {
    if (theme === 'lightTheme') setTheme('darkTheme')
    else setTheme('lightTheme')
  }

  const themeSwitch = () => {
    return (
      <Button onClick={toggleTheme}>
        {theme === 'lightTheme' ? (
          <i
            role='button'
            title='dark theme moon button'
            aria-label='theme switcher button'
          >
            <MoonSvg />
          </i>
        ) : (
          <i
            role='button'
            title='light theme moon button'
            aria-label='theme switcher button'
          >
            <SunSvg />
          </i>
        )}
      </Button>
    )
  }
  const SocialMediaIcons = () => {
    return (
      <>
        <StyledA
          href='https://www.linkedin.com/in/aniket-nagrale-80939a179/'
          target='_blank'
          rel='noopener noreferrer'
          title='linkedin'
          tabIndex='0s'
          aria-label='linkedin icon'
        >
          <img
            src={
              window.innerWidth < 768
                ? 'images/linkedinDark.png'
                : theme === 'darkTheme'
                ? 'images/linkedinDark.png'
                : 'images/linkedinLight.png'
            }
            alt='linkedin'
            aria-label='linkedin icon'
          />
          
        </StyledA>
        <StyledA
          href='https://github.com/Aniket0723'
          target='_blank'
          rel='noopener noreferrer'
          title='Github'
          tabIndex='0s'
          aria-label='github icon'
        >
          <img
            src={
              window.innerWidth < 768
                ? 'images/githubDark.png'
                : theme === 'darkTheme'
                ? 'images/githubDark.png'
                : 'images/githubLight.png'
            }
            alt='github'
            aria-label='github icon'
          />
        </StyledA>
      </>
    )
  }

  const mobileMenu = () => {
    return (
      <StyledMobileMenu>
        {navLinks.map(({ navLinkId, scrollToId }, idx) => {
          return (
            <LazyMotion key={idx} features={domAnimation}>
              <m.div animate={{ x: [200, 0] }}>
                <StyledMobileLink onClick={() => setIsOpen(!isOpen)}>
                  <NavLink
                    key={idx}
                    navLinkId={navLinkId}
                    scrollToId={scrollToId}
                  />
                </StyledMobileLink>
              </m.div>
            </LazyMotion>
          )
        })}
        <LazyMotion features={domAnimation}>
          <m.div animate={{ x: [200, 0] }}>
            <SocialMediaWrapper>{SocialMediaIcons()}</SocialMediaWrapper>
          </m.div>
        </LazyMotion>
      </StyledMobileMenu>
    )
  }

  return (
    <StyledNavbar>
      <StyledName
        title='name'
        role='img'
        aria-label='name'
        tabIndex='-1'
        aria-labelledby='aniket'
      >
        <img
          src={
            theme === 'darkTheme'
              ? 'images/logo-no-background.png'
              : 'images/logo-no-background-dark.png'
          }
          alt='initials'
          title='initials'
          tabIndex='0'
          aria-label='initials'
          aria-labelledby='aniket'
        />
      </StyledName>
      <StyledLinks>
        {navLinks.map(({ navLinkId, scrollToId }, idx) => {
          return (
            <NavLink key={idx} navLinkId={navLinkId} scrollToId={scrollToId} />
          )
        })}
      </StyledLinks>
      <StyledIcons>
        {SocialMediaIcons()}
        {themeSwitch()}
      </StyledIcons>
      <HamburgerBtn aria-label='menu' role='menubar'>
        <span
          style={{
            display: 'flex',
            width: '70px',
            justifyContent: 'space-between',
          }}
        >
          {themeSwitch()}

          {isOpen ? (
            <LazyMotion features={domAnimation}>
              <m.div
                animate={{ rotate: 360, x: ['25px', '0px'] }}
                transition={{ type: 'spring', damping: 25, delayChildren: 0.5 }}
              >
                <img
                  src={
                    theme === 'darkTheme'
                      ? 'images/closeDark.png'
                      : 'images/closeLight.png'
                  }
                  height='24px'
                  width='24px'
                  alt='close icon'
                  aria-label='close icon'
                  onClick={() => setIsOpen(false)}
                />
              </m.div>
            </LazyMotion>
          ) : (
            <LazyMotion features={domAnimation}>
              <m.div
                animate={{ x: ['25px', '0px'] }}
                transition={{ type: 'spring', damping: 25, delayChildren: 0.5 }}
              >
                <img
                  src={
                    theme === 'darkTheme'
                      ? 'images/hamburgerDark.png'
                      : 'images/hamburgerLight.png'
                  }
                  alt='menu icon'
                  aria-label='menu icon'
                  height='22px'
                  width='22px'
                  onClick={() => setIsOpen(true)}
                />
              </m.div>
            </LazyMotion>
          )}
        </span>
      </HamburgerBtn>
      {isOpen && mobileMenu()}
    </StyledNavbar>
  )
}

export default Navbar
