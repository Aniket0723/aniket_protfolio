import React, { useState } from 'react'
import styled from 'styled-components/macro'
import { OtherProjects } from '../assets/projects'
import { Fade } from 'react-awesome-reveal'

const StyledMoreProjectsWrapper = styled.section`
  /* border: 1px solid teal; */
  width: 100%;
  box-sizing: border-box;
`

const StyledMoreProjects = styled.section`
  /* border: 1px solid red; */
  width: 80%;
  min-height: 50vh;
  margin: 0 auto;
  /* margin-bottom: 5rem; */
  padding-bottom: 5rem;
  color: #404040;
  max-width: 1000px;

  @media (max-width: 790px) {
    width: 90%;
  }
  @media (max-width: 500px) {
    width: 85%;
  }
`

const H3 = styled.h3`
  font-size: clamp(35px, 5vw, 60px);
  text-align: center;
  margin: 7rem 0;
  font-family: 'Inter', sans-serif;
  color: ${(props) => props.theme.text};

  @media (max-width: 500px) {
    margin: 5rem 0;
  }
`
const StyledCardContainer = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 18px;
  color: ${(props) => props.theme.text};
`

const StyledCard = styled.div`
  padding: 1.5rem 1rem;
  border-radius: 5px;
  background-color: ${(props) => props.theme.moreProjectsCardBackgroundColor};
  transition: ${(props) => props.theme.themeTransition.transition};
  box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 12px;
  height: 230px;
  transition: background-color 0.5s linear, transform 0.2s linear;
  &:hover {
    transform: translateY(-7px);
  }

  .header {
    font-size: 40px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.8rem;
    img {
      opacity: 0.9;
      height: 42px;
      width: 42px;
    }
    a {
      padding-left: 15px;

      img {
        height: 28px;
        width: 28px;
        &:hover {
          transition: all 0.1s ease-in-out;
          transform: translateY(-3px) translateZ(0px);
        }
      }
    }
  }

  .project-title {
    font-size: 1.4rem;
    line-height: 1.1rem;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    letter-spacing: 1px;
    margin-bottom: 1rem;
  }

  .project-description {
    font-size: 16px;
    font-weight: 400;
    min-height: 90px;
    letter-spacing: 0.6px;
    line-height: 1.3rem;
    margin-top: 1.2rem;
    color: ${(props) => props.theme.lightText};
  }
  .languages {
    display: flex;
    margin-top: 1.2rem;
    float: left;
    justify-content: space-evenly;
    font-family: 'Roboto Mono', monospace;
    color: ${(props) => props.theme.lightText};
    /* font-weight:900; */
    span {
      font-size: 13px;
      padding-right: 0.6rem;
    }
  }
`
const Button = styled.button`
  /* background: #404040; */
  display: block;
  color: ${(props) => props.theme.body};
  padding: 1.25rem 1.75rem;
  margin: 5rem auto 2rem auto;
  cursor: pointer;
  font-size: 13px;
  font-family: 'Roboto Mono', monospace;
  border: none;
  border-radius: 4px;
  transition: ${(props) => props.theme.themeTransition.transition};
  /* background: #2f2f2f; */
  background-color: ${(props) => props.theme.buttonColor};
  &:hover {
    filter: brightness(1.2);
    /* background: black; */
  }
`

const MoreProjects = ({ theme }) => {
  const [visible, setVisible] = useState(3)
  const [damping, setDamping] = useState(0.2)

  const showMoreProjects = () => {
    setDamping(0.08)
    if (visible < OtherProjects.length) setVisible((prevValue) => prevValue + 3)
    else setVisible(3)
  }

  const OtherProjectsWrapper = () => {
    return (
      <>
        <StyledCardContainer>
          <Fade cascade damping={damping} triggerOnce>
            {OtherProjects.slice(0, visible).map((project, index) => {
              return (
                <StyledCard key={index}>
                  <div className='header'>
                    <img
                      src={
                        theme === 'darkTheme'
                          ? 'images/folderDark.png'
                          : 'images/folderLight.png'
                      }
                      alt='Github link'
                      aria-label='github link'
                    />
                    {/* <FiFolder /> */}
                    <div>
                      <a
                        aria-label='Github link'
                        href={project.github}
                        target='_blank'
                        rel='noopener noreferrer'
                        title='Github link'
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
                        rel='noopener noreferrer'
                        title='Live link'
                        aria-label='Live link'
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
                    </div>
                  </div>
                  <div
                    className='project-title'
                    aria-label='project-title'
                    title='title'
                    role='article'
                  >
                    {project.title}
                  </div>
                  <p
                    className='project-description'
                    aria-label='project-description'
                    title='description'
                    role='article'
                  >
                    {project.description}
                  </p>
                  <div
                    className='languages'
                    aria-label='project languages'
                    title='languages used'
                  >
                    {project.languages.map((language, index) => {
                      return (
                        <span key={index} title={language}>
                          {language}
                        </span>
                      )
                    })}
                  </div>
                </StyledCard>
              )
            })}
          </Fade>
        </StyledCardContainer>
      </>
    )
  }
  return (
    <StyledMoreProjectsWrapper>
      <StyledMoreProjects>
        <H3 aria-level='1' title='more projects' aria-label='Other Projects'>
          Other Projects
        </H3>
        {OtherProjectsWrapper()}

        <Button onClick={showMoreProjects}>
          Show {visible === 21 ? 'Less' : 'More'}
        </Button>
      </StyledMoreProjects>
    </StyledMoreProjectsWrapper>
  )
}

export default MoreProjects
