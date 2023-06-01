import React from "react";
import styled from "styled-components/macro";
import { Link } from "react-router-dom";
import { useNav } from "../hooks/useNav";
import Particle from "./Particles";
import { Fade } from "react-awesome-reveal";

const StyledWrapper = styled.section`
  -webkit-transition: background-image 0.5s linear;
  transition: background-image 0.5s linear;
  background-repeat: no-repeat;
  background-size: cover;
`

const StyledLandingPage = styled.section`
  color: ${(props) => props.theme.landingPage.text};
  transition: color 0.5s linear;
  min-height: 90vh;
  width: 80%;
  /* border: 1px solid red; */
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  letter-spacing: 1.1px;
  & > * {
    -webkit-font-smoothing: antialiased;
  }
  @media (max-width: 400px) {
    width: 100%;
    min-height: 96vh;
    flex-direction: column;
    column-gap:20px
  }
`
const StyledLeft = styled.div`
  /* border: 1px solid red; */
  width: 50%;
  height: 500px;
  background-position: center;
  @media (max-width: 999px) {
    height: 700px;
  }
  @media (max-width: 400px) {
    width: 90%;
    height: 250px;
  }
`
const StyledRight = styled.div`
  width: 50%;
  /* border: 1px solid tan; */
  display: flex;
  height: 700px;
  align-items: flex-start;
  justify-content: center;
  img {
    /* border: 1px solid rosybrown; */
    min-width: 350px;
    width: 80%;
    height: 550px;
    @media (max-width: 400px) {
      height: 350px;
    }
  }
  @media (max-width: 400px) {
    height: auto;
    margin-top:200px
  }
`

const StyledH4 = styled.h4`
  font-size: 20px;
  font-weight: 400;
  padding-left: 0.9rem;
  font-family: 'Roboto Mono', monospace;
  margin-bottom: 8px;
  transition: color 0.5s linear;
  @media (max-width: 400px) {
    padding-left: 0.4rem;
    padding-top: 1rem;
  }
`
const StyledH1 = styled.h1`
  font-size: clamp(35px, 8vw, 80px);
  font-weight: 600;
  line-height: 1.1;
  transition: color 0.5s linear;
  font-family: 'Inter', sans-serif;
`
const StyledH3 = styled.h3`
  font-size: clamp(10px, 5.5vw, 50px);
  font-weight: 600;
  margin: 8px 0;
  transition: color 0.5s linear;
  font-family: 'Inter', sans-serif;
`
const StyledP = styled.p`
  /* width: 650px; */
  max-width: 650px;
  font-size: 20px;
  transition: color 0.5s linear;
  color: ${(props) => props.theme.lightText};
  line-height: 1.5;
  @media (max-width: 400px) {
    width: 100%;
    font-size: 16px;
    margin-top: 5px;
  }
`
const LandingPage = ({ theme }) => {
  const linkStyle = {
    fontSize: "1.2rem",
    color: "white",
    backgroundColor: "#404040",
    padding: "10px",
    borderRadius: "5px",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    columnGap: ".5rem",
    margin: "20px",
  };
  const landingPageRef = useNav("Home");
  // this is the ref for the navbar
  return (
    <StyledWrapper ref={landingPageRef} id="landingContainer">
      <div style={{ position: "relative" }}>
        <Particle />
        <StyledLandingPage>
          <StyledLeft>
            <Fade cascade damping="0.6" triggerOnce>
              <StyledH4
                aria-label="hi my name is"
                role="article"
                tabIndex="0"
                title="hi my name is"
              >
                Hi, my name is
              </StyledH4>
              <StyledH1
                aria-label="I am a software engineer"
                role="article"
                tabIndex="0"
              >
                Aniket Nagrale
              </StyledH1>
              <StyledH3
                aria-label="A frontend developer"
                role="article"
                tabIndex="0"
              >
                A Web Developer.
              </StyledH3>
              <br />
              <StyledP aria-label="paragraph" role="article" tabIndex="0">
                I&apos; am trained fresher. Willing to join growing organization
                to utilize my technology and skills in an esteemed organization.
                Proficient in an assortment of technologies, including
                JavaScript, React.js, Node.js, Express.js and MongoDB. Able to
                effectively self-manage during independent project, as well as
                collaborate in a team setting.
              </StyledP>
              <Link
                to="https://drive.google.com/uc?export=download&id=1k313Tk98TJh6JsMeosTlJkoiN2diXiqr"
                style={linkStyle}
              >
                Download Resume
              </Link>
            </Fade>
          </StyledLeft>
          <StyledRight>
            <Fade delay={4000} triggerOnce>
              <img
                src={
                  theme === "darkTheme"
                    ? "images/landingHero.svg"
                    : "images/landingHeroInvert.svg"
                }
                alt="hero"
                aria-label="hero"
              />
            </Fade>
          </StyledRight>
        </StyledLandingPage>
      </div>
    </StyledWrapper>
  );
};

export default LandingPage;
