import React from "react";
import styled from "styled-components/macro";
import { useNav } from "../hooks/useNav";
import { Fade } from "react-awesome-reveal";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiNodedotjs,
  SiMongodb,
} from "react-icons/si";

const StyledLandingPage = styled.section`
  color: ${(props) => props.theme.text};
  min-height: 80vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 1rem;
`;

const HeroContent = styled.div`
  max-width: 800px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const AvatarWrapper = styled.div`
  width: 120px;
  height: 120px;
  margin-bottom: 2rem;
  border-radius: 50%;
  overflow: hidden;
  background: ${(props) => props.theme.cardBg};
  border: 1px solid ${(props) => props.theme.border};
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Greeting = styled.p`
  font-family: "Roboto Mono", monospace;
  font-size: 1rem;
  color: ${(props) => props.theme.secondaryText};
  margin-bottom: 1rem;
`;

const Headline = styled.h1`
  font-family: "Syne", sans-serif;
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: ${(props) => props.theme.text};
  text-transform: uppercase;
  letter-spacing: -0.02em;

  span {
    color: ${(props) => props.theme.secondaryText};
  }
`;

const SubHeadline = styled.p`
  font-size: 1.4rem;
  color: ${(props) => props.theme.secondaryText};
  max-width: 600px;
  line-height: 1.6;
  margin-bottom: 2.5rem;
`;

const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 3rem;
`;

const TechCapsule = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${(props) => props.theme.cardBg};
  border: 1px dashed ${(props) => props.theme.border};
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${(props) => props.theme.secondaryText};
  transition: all 0.2s ease;

  &:hover {
    border-style: solid;
    color: ${(props) => props.theme.text};
    transform: translateY(-2px);
  }

  svg {
    font-size: 1.1rem;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 3rem;

  a {
    font-size: 1.5rem;
    color: ${(props) => props.theme.secondaryText};
    transition: color 0.2s ease, transform 0.2s ease;

    &:hover {
      color: ${(props) => props.theme.text};
      transform: scale(1.1);
    }
  }
`;

const LandingPage = () => {
  const landingPageRef = useNav("Home");

  return (
    <StyledLandingPage ref={landingPageRef} id="landingContainer">
      <HeroContent>
        <Fade direction="up" cascade damping={0.1} triggerOnce>
          <AvatarWrapper>
            <img src="images/avatar.png" alt="Aniket Nagrale" />
          </AvatarWrapper>

          <Greeting>Hi there, I&apos;m</Greeting>
          <Headline>
            Aniket Nagrale<span>.</span>
          </Headline>

          <SubHeadline>
            Frontend / Web Developer with hands-on experience in building
            responsive applications using React.js, JavaScript, and modern UI
            libraries. Skilled in refactoring legacy code, integrating REST
            APIs, and optimizing performance with strong problem-solving skills.
          </SubHeadline>

          <TechStack>
            <TechCapsule>
              <SiTypescript style={{ color: "#3178C6" }} /> TypeScript
            </TechCapsule>
            <TechCapsule>
              <SiReact style={{ color: "#61DAFB" }} /> React
            </TechCapsule>
            <TechCapsule>
              <SiNextdotjs /> Next.js
            </TechCapsule>
            <TechCapsule>
              <SiTailwindcss style={{ color: "#06B6D4" }} /> Tailwind
            </TechCapsule>
            <TechCapsule>
              <SiNodedotjs style={{ color: "#339933" }} /> Node.js
            </TechCapsule>
            <TechCapsule>
              <SiMongodb style={{ color: "#47A248" }} /> MongoDB
            </TechCapsule>
          </TechStack>

          <SocialLinks>
            <a
              href="https://github.com/Aniket0723"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <FaGithub />
            </a>
            <a
              href="https://www.linkedin.com/in/aniket-nagrale-80939a179/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://twitter.com/yourusername"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
            <a href="mailto:anunagrale77@gmail.com" aria-label="Email">
              <FaEnvelope />
            </a>
          </SocialLinks>
        </Fade>
      </HeroContent>
    </StyledLandingPage>
  );
};

export default LandingPage;
