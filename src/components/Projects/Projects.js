import React from 'react'
import styled from 'styled-components/macro'
import { useNav } from '../../hooks/useNav'
import { FeaturedProjectsList } from '../assets/projects'
import { Fade } from 'react-awesome-reveal'

const StyledProjectsWrapper = styled.section`
  width: 100%;
  box-sizing: border-box;
  min-height: 100vh;
  transition: ${(props) => props.theme.themeTransition.transition};
  background-color: ${(props) => props.theme.body};
`

const StyledProjects = styled.section`
  width: 80%;
  margin: 0 auto;
  color: #404040;
  .fade {
    margin: 7rem auto;
    @media (max-width: 500px) {
      margin: 3rem auto;
    }
  }
  @media (max-width: 787px) {
    /* width: %; */
  }
  @media (max-width: 500) {
    width: 95%;
  }
`
const H3 = styled.h3`
  font-size: clamp(40px, 5.5vw, 60px);
  margin-bottom: 2rem;
  padding-top: 5rem;
  font-family: 'Inter', sans-serif;
  display: flex;
  color: ${(props) => props.theme.text};

  &::after {
    content: '';
    display: block;
    position: relative;
    top: 37px;
    width: 300px;
    height: 1px;
    margin-left: 20px;
    background-color: #404040;
  }
  @media (max-width: 913px) {
    &::after {
      content: none;
    }
  }

  @media (max-width: 500px) {
    /* margin-top: 4.5rem; */
  }
`
const P = styled.p`
  line-height: 1.2;
  font-size: clamp(18px, 4vw, 22px);
  max-width: 650px;
  color: ${(props) => props.theme.lightText};
  @media (max-width: 500px) {
    margin-bottom: 2rem;
  }
`

const StyledFeaturedProjects = styled.div`
  /* border: 1px solid #404040; */
  display: flex;
  max-width: 1000px;
  &:not(:last-child) {
    margin: 7rem auto;

    @media (max-width: 500px) {
      margin: 2rem auto;
    }
  }
  &:last-child {
    margin: 0 auto;
  }
  align-items: center;
  transition: all 0.3s linear;

  @media (max-width: 500px) {
    flex-direction: column;
    box-shadow: rgba(17, 17, 26, 0.05) 0px 1px 0px,
      rgba(17, 17, 26, 0.1) 0px 0px 8px;
    padding: 1rem;

    border-radius: 8px;
    margin-top: 1rem;
  }
`
const StyledLeft = styled.div`
  width: 50%;
  /* border: 5px solid teal; */
  height: 300px;
  text-align: right;
  /* background: url('images/typing.PNG'); */
  background: url(${(props) => props.url});
  opacity: ${(props) => props.theme.opacity};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
  transition: all 0.2s linear;
  &:hover {
    transform: translateY(-5px) translateZ(0px);
  }

  @media (max-width: 500px) {
    width: 100%;
    /* height: 280px; */
    background-color: white;
    /* background-size: ${(props) => props.theme.backgroundSize}; */
    padding: ${(props) => props.theme.projectCardPaddingInner};
    border-radius: 8px;
    opacity: 0.4;
  }
`
const StyledRight = styled.div`
  width: 50%;
  /* border: 1px solid orange; */
  min-height: 280px;
  max-width: 26rem;
  z-index: 2;

  h2 {
    text-align: right;
    font-size: 1.5rem;
    line-height: 2rem;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    letter-spacing: 1px;
    color: ${(props) => props.theme.text};

    @media (max-width: 500px) {
      text-align: left;
    }
  }
  h1 {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    letter-spacing: 0.3px;
    margin-bottom: 1rem;
    text-align: right;
    font-size: 1.1rem;
    line-height: 1.75rem;
    color: ${(props) => props.theme.lightText};
    /* color: rgba(64, 64, 64, 1); */

    @media (max-width: 500px) {
      text-align: left;
      margin-bottom: 0;
    }
  }
  p {
    text-align: right;
    margin-left: -100px;
    font-size: 1rem;
    font-weight: 400;
    letter-spacing: 0.7px;
    padding: 1.5rem 2rem;
    min-height: 60px;
    box-shadow: 0 4px 20px rgb(0 0 0 / 25%);
    max-width: 30rem;
    transition: ${(props) => props.theme.themeTransition.transition};
    background-color: ${(props) => props.theme.projectDesc};
    /* background-color: #ffffff; */
    color: ${(props) => props.theme.lightText};
    border-radius: 0.375rem;
    z-index: 2;

    @media (max-width: 769px) {
      padding: 0.8rem 1rem;
    }
    @media (max-width: 500px) {
      margin-left: 0;
      box-shadow: none;
      background-color: transparent;
      font-weight: ${(props) => props.theme.projectCardFontWeight};
      /* color: black; */
      color: ${(props) => props.theme.text};
      text-align: left;
      padding: 1.5rem 0;
    }
  }
  @media (max-width: 500px) {
    margin-top: -282px;
    width: 100%;
    color: black;
    z-index: 999;
  }
`
const StyledLanguagesUsed = styled.div`
  display: flex;
  margin-top: 2rem;
  float: right;
  font-size: 13.5px;
  justify-content: space-evenly;
  font-family: 'Roboto Mono', monospace;
  color: ${(props) => props.theme.lightText};
  span {
    padding-left: 0.4rem;

    @media (max-width: 500px) {
      padding-left: 0;
      padding-right: 0.5rem;
    }
  }
  @media (max-width: 500px) {
    float: left;
    margin-top: 0rem;
  }
`
const StyledLinks = styled.div`
  margin-top: 6rem;
  padding-top: 0.5rem;
  font-size: 24px;
  text-align: right;
  a {
    /* color: ${(props) => props.theme.text}; */
    /* color: #404040; */
    img {
      height: 28px;
      width: 28px;
      &:hover {
        transition: all 0.1s ease-in-out;
        transform: translateY(-3px) translateZ(0px);
      }
    }
    &:first-of-type {
      padding-right: 1rem;
    }
  }
  @media (max-width: 500px) {
    margin-top: 1.7rem;
    text-align: left;
  }
`

const Projects = ({ theme }) => {
  const projectsRef = useNav('Projects')
  return (
    <StyledProjectsWrapper>
      <StyledProjects id='projectsContainer' ref={projectsRef}>
        <H3
          aria-level='1'
          title='Some things i have built'
          aria-label='Display Projects'
        >
          Some Things I’ve Built
        </H3>
        <P>
          Here are some of my most favourite projects that I enjoyed coding and
          designing from scratch.
        </P>
        <Fade className='fade' cascade delay='1.8' triggerOnce>
          {FeaturedProjectsList.map((project) => {
            return (
              <StyledFeaturedProjects key={project.id}>
                <StyledLeft url={project.img}></StyledLeft>
                <StyledRight>
                  <h2>{project.title}</h2>
                  <h1>{project.subject}</h1>
                  <p>{project.description}</p>

                  <StyledLanguagesUsed>
                    {project.languages.map((language) => {
                      return <span key={language}>{language}</span>
                    })}
                  </StyledLanguagesUsed>
                  <StyledLinks>
                    <a
                      href={project.github}
                      target='_blank'
                      rel='noreferrer'
                      aria-label='github link'
                      title='github link'
                    >
                      <img
                        src={
                          theme === 'darkTheme'
                            ? 'images/githubDark.png'
                            : 'images/githubLight.png'
                        }
                        alt='Github link'
                        aria-label='github link'
                      />
                    </a>
                    <a
                      href={project.live}
                      target='_blank'
                      rel='noreferrer'
                      aria-label='live project link'
                      title='live project link'
                    >
                      <img
                        src={
                          theme === 'darkTheme'
                            ? 'images/externalLinkDark.png'
                            : 'images/externalLinkLight.png'
                        }
                        alt='Github link'
                        aria-label='github link'
                      />
                    </a>
                  </StyledLinks>
                </StyledRight>
              </StyledFeaturedProjects>
            )
          })}
        </Fade>
      </StyledProjects>
    </StyledProjectsWrapper>
  )
}

export default Projects
