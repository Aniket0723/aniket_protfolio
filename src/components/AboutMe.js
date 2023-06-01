import React from "react";
import styled from "styled-components/macro";
import { Link } from "react-router-dom";
import { useNav } from "../hooks/useNav";
import { Fade } from "react-awesome-reveal";
const StyledAboutMeWrapper = styled.section`
  @media (max-width: 640px) {
    width: 100%;
  }
`;

const StyledAboutMe = styled.section`
  box-sizing: border-box;
  min-height: 100vh;
  width: 80%;
  /* border: 1px solid red; */
  margin: 0 auto;

  /* color: #404040; */
  color: ${(props) => props.theme.text};
  display: flex;
  flex-direction: column;
  justify-content: center;
  @media (max-width: 640px) {
    padding: 0 1.2rem;
    margin-top:-5rem;
  }
`;

const H1 = styled.h1`
  font-size: clamp(40px, 5.5vw, 60px);
  margin-bottom: 2rem;
  margin-top: 4rem;
  padding-top: 1rem;
  font-family: "Inter", sans-serif;
  @media (max-width: 640px) {
    margin-top: 4.5rem;
  }
`;

const StyledContainer = styled.div`
  display: flex;
  @media (max-width: 913px) {
    flex-direction: column;
  }
`;
const StyledLeft = styled.div`
  /* border: 3px solid palegoldenrod; */
  width: 50%;
  @media (max-width: 913px) {
    width: 100%;
  }
`;
const StyledRight = styled.div`
  /* border: 3px solid green; */
  width: 50%;
  @media (max-width: 913px) {
    width: 100%;
  }
`;
const Article = styled.article`
  /* border: 3px solid purple; */
  max-width: 750px;
  font-weight:500;
  font-size: 20px;
  font-family: 'Roboto Mono', monospace;
  transition: color 0.5s linear;
  color: ${(props) => props.theme.lightText};
  letter-spacing: 1px;
  line-height: 1.5;
  img {
    height: 20px;
    width: 20px;
    vertical-align: bottom;
    &:hover {
      height: 40px;
      width: auto;
      transition: height 0.4s ease-in-out;
    }
    &:not(:hover) {
      transition: height 0.2s ease-in-out;
    }
  }
`;
const H3Left = styled.h3`
  font-family: "Inter", sans-serif;
  margin: 1.5rem 0;
  font-size: clamp(10px, 5.5vw, 22px);
  padding: 1rem 3.8rem;
  padding-bottom: 0;

  @media (max-width: 913px) {
    font-size: clamp(10px, 5.5vw, 25px);
    text-align: center;
  }
  @media (max-width: 640px) {
    padding: 1rem 0;
  }
`;

const H3 = styled.h3`
  font-family: "Inter", sans-serif;
  margin: 1.5rem 0;
  font-size: clamp(10px, 5.5vw, 22px);
  padding: 1rem 3.8rem;
  padding-bottom: 0;

  &:nth-child(1) {
    font-size: clamp(20px, 3vw, 30px);
    text-align: center;
  }
`;
const StyledExp = styled.div`
  border-radius: 15px;
  padding: 1rem 2rem;

  @media (max-width: 913px) {
    padding: 0;
    display: flex;
    justify-content: center;
  }
  @media (max-width: 640px) {
    padding: 0;
  }
`;

const StyledUl = styled.ul``;

const StyledLiContent = styled.div`
  max-width: 400px;
  padding: 1rem;
  border-radius: 10px;
  font-family: 'Roboto Mono', monospace;
  color: ${(props) => props.theme.text};
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;

  @media (max-width: 640px) {
    width: 95%;
    padding: 0.5rem;
  }
`;
const StyledLi = styled.li`
  padding-bottom: 2rem;
  border-left: 2px solid #abaaed;
  position: relative;
  padding-left: 20px;
  margin-left: 10px;
  font-family: "Roboto Mono", monospace;

  &:last-child {
    border: 0;
    /* border-left: 2px solid #abaaed; */
    padding-bottom: 0rem;
  }
  &:before {
    content: "";
    width: 15px;
    height: 15px;
    background: white;
    border: 1px solid #4e5ed3;
    box-shadow: 3px 3px 0px #bab5f8;
    box-shadow: 3px 3px 0px #bab5f8;
    border-radius: 50%;
    position: absolute;
    left: -10px;
    top: 0px;
  }
  letter-spacing: -0.5px;
  line-height: 1.5rem;
  div {
    font-weight: 500;
    font-size: 1.01rem;
  }

  p {
    font-weight: 400;
    font-size: 0.985rem;
    color: ${(props) => props.theme.lightText};
  }
  span {
    font-weight: 400;
    font-size: 0.9rem;
    color: ${(props) => props.theme.lightText};
  }

  @media (max-width: 640px) {
    margin-left: 0;

    div {
      font-size: 0.95rem;
    }
    p {
      font-size: 0.8rem;
    }
    span {
      font-size: 0.7rem;
    }
    &:last-of-type {
      div {
        font-size: 0.91rem;
      }
    }
  }
`;
const StyledLogosWrapper = styled.div`
  /* border: 1px solid red; */
  display: grid;
  /* padding-top: 8rem; */
  grid-template-columns: repeat(3, minmax(80px, 130px));
  grid-template-rows: repeat(4, 1fr);
  gap: 1.5rem;
  text-align: center;
  justify-content: center;
  align-items: end;

  a {
    text-decoration: none;
  }
`;
const StyledLogos = styled.div`
  padding: 0.8rem 0.5rem 0.5rem 0.5rem;
  box-shadow: ${(props) => props.theme.boxShadow};
  /* box-shadow: rgb(0 0 0 / 10%) 0px 4px 20px; */
  opacity: 1;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.1s ease-in-out;
  &:hover {
    transform: translateY(-3px) translateZ(0px);
  }

  img {
    width: 50px;
    height: 50px;
  }
  p {
    color: ${(props) => props.theme.text};
    margin-top: 0.5rem;
    font-family: "Inter", sans-serif;
    font-weight: 600;
    letter-spacing: 0.5px;

    @media (max-width: 640px) {
      font-size: 0.8rem;
      letter-spacing: 0.2px;
    }
  }
`;

const AboutMe = () => {
  const aboutRef = useNav("About");
  const linkStyle = {
    fontSize: "0.8rem",
    color: "white",
    backgroundColor: "#404040",
    padding: "6px",
    borderRadius: "5px",
    textDecoration: "none",
    marginLeft: "50px",
    textAlign: "center",
    justifyContent: "center",
  };

  return (
    <StyledAboutMeWrapper>
      <StyledAboutMe id="aboutContainer" ref={aboutRef}>
        <div style={{ position: "relative" }}>
          <H1>About Me</H1>

          <StyledContainer>
            <StyledLeft>
              <Fade cascade triggerOnce>
                <Article>
                  I&apos;m a Web developer from Nagpur,MH INDIA.
                  <br /> I have worked on different Projects that have enabled
                  me to enhance my skills in React.js and other JavaScript
                  frameworks. Currently getting much more interest in <b>Next.js</b> & <b>Web3</b>.
                  Apart from this I loved to play
                   Football ⚽ and Travelling 🧳.
                </Article>
                <Fade delay={300} triggerOnce>
                  <H3Left
                    aria-label="Experience and Education"
                    aria-level="1"
                    title="Experience and education"
                  >
                    Experience &amp; Education
                  </H3Left>
                </Fade>
                <StyledExp>
                  <StyledUl>
                    <StyledLi>
                      <Fade triggerOnce>
                        <StyledLiContent>
                          <div>Full Stack Developer Intern</div>
                          <p>DevTown</p>
                          <span>Nov 2022 - Feb 2023 </span>
                          <Link
                            to="https://drive.google.com/uc?export=download&id=1RduiAmRNObyasTk-miy5ir1rFC7oZLY7"
                            style={linkStyle}
                          >
                            Certificate{" "}
                          </Link>
                        </StyledLiContent>
                      </Fade>
                    </StyledLi>
                    <StyledLi>
                      <Fade delay={1150} triggerOnce>
                        <StyledLiContent>
                          <div>G H RAISONI COLLEGE OF ENGINEERING,NAGPUR</div>
                          <p>B.E in Electronics Engineering</p>
                          <span>Aug 2018 - May 2022</span>
                        </StyledLiContent>
                      </Fade>
                    </StyledLi>
                  </StyledUl>
                </StyledExp>
              </Fade>
            </StyledLeft>
            <StyledRight>
              <H3 aria-level="1" title="Skills" aria-label="Skills section">
                Skills
              </H3>
              <StyledLogosWrapper>
                <Fade cascade damping="0.25" triggerOnce>
                  <a
                    href="https://developer.mozilla.org/en-US/docs/Glossary/HTML5"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <StyledLogos>
                      <img
                        src="images/html5.svg"
                        alt="html"
                        aria-label="html icon"
                        tabIndex="0"
                      />
                      <p>Html5</p>
                    </StyledLogos>
                  </a>
                  <a
                    href="https://developer.mozilla.org/en-US/docs/Web/CSS"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <StyledLogos>
                      <img
                        src="images/css3.svg"
                        alt="css3"
                        aria-label="css3 icon"
                        tabIndex="0"
                      />
                      <p>CSS3</p>
                    </StyledLogos>
                  </a>
                  <a
                    href="https://www.javascript.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <StyledLogos>
                      <img
                        src="images/javascript.svg"
                        alt="javascript"
                        aria-label="javascript icon"
                        tabIndex="0"
                      />
                      <p>JavaScript</p>
                    </StyledLogos>
                  </a>
                  <a
                    href="https://reactjs.org/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <StyledLogos>
                      <img
                        src="images/react.svg"
                        alt="react"
                        aria-label="react icon"
                        tabIndex="0"
                      />
                      <p>React</p>
                    </StyledLogos>
                  </a>
                  <a
                    href="https://www.mongodb.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <StyledLogos>
                      <img
                        src="images/mongodb.svg"
                        alt="mongodb"
                        aria-label="mongodb icon"
                        tabIndex="0"
                      />
                      <p>MongoDB</p>
                    </StyledLogos>
                  </a>
                  <a
                    href="https://expressjs.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <StyledLogos>
                      <img
                        src="images/express.svg"
                        alt="express"
                        aria-label="express icon"
                        tabIndex="0"
                      />
                      <p>Express</p>
                    </StyledLogos>
                  </a>
                  <a
                    href="https://nodejs.org/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <StyledLogos>
                      <img
                        src="images/node-js.svg"
                        alt="node"
                        aria-label="node icon"
                        tabIndex="0"
                      />
                      <p>Node Js</p>
                    </StyledLogos>
                  </a>

                  <a
                    href="https://www.cplusplus.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <StyledLogos>
                      <img
                        src="images/c.svg"
                        alt="c++"
                        aria-label="c++ icon"
                        tabIndex="0"
                      />
                      <p>C++</p>
                    </StyledLogos>
                  </a>
                </Fade>
              </StyledLogosWrapper>
            </StyledRight>
          </StyledContainer>
        </div>
      </StyledAboutMe>
    </StyledAboutMeWrapper>
  );
};

export default AboutMe;
