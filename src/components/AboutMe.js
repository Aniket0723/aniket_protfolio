import React from "react";
import styled from "styled-components/macro";
import { useNav } from "../hooks/useNav";
import { Fade } from "react-awesome-reveal";
import {
  FaReact,
  FaNodeJs,
  FaGitAlt,
  FaDatabase,
  FaPlug,
} from "react-icons/fa";
import {
  SiJavascript,
  SiTypescript,
  SiNextdotjs,
  SiRedux,
  SiTailwindcss,
  SiMongodb,
  SiExpress,
  SiVercel,
  SiCplusplus,
  SiMysql,
  SiPostgresql,
  SiPostman,
  SiNetlify,
  SiHtml5,
  SiCss3,
  SiSass,
} from "react-icons/si";

const StyledAboutSection = styled.section`
  color: ${(props) => props.theme.text};
  padding: 0 4rem 2rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0 1.5rem 4rem;
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-family: "Victor Mono", monospace;
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &::after {
    content: "";
    height: 1px;
    flex-grow: 1;
    background: ${(props) => props.theme.border};
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
    gap: 0.5rem;
  }
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const TimelineItem = styled.div`
  padding-left: 1.5rem;
  border-left: 1.5px solid ${(props) => props.theme.border};
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${(props) => props.theme.text};
  }

  @media (max-width: 768px) {
    padding-left: 1rem;
  }
`;

const TimelineHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const CompanyLogo = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: contain;
  border: 1px solid ${(props) => props.theme.border};
  outline: 1px solid ${(props) => props.theme.border};
  outline-offset: 3px;
  background: white;
  padding: 5px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const CompanyLogoActive = styled(CompanyLogo)`
  animation: glowPulse 2s ease-in-out infinite;

  @keyframes glowPulse {
    0%,
    100% {
      box-shadow: 0 0 6px 2px ${(props) => props.theme.secondaryText}44;
      outline-color: ${(props) => props.theme.secondaryText}88;
    }
    50% {
      box-shadow: 0 0 20px 8px ${(props) => props.theme.secondaryText}99;
      outline-color: ${(props) => props.theme.secondaryText};
    }
  }
`;

const TimelineInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const Role = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};

  @media (max-width: 768px) {
    font-size: 1.15rem;
  }
`;

const CompanyName = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.secondaryText};
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const DurationText = styled.span`
  font-size: 0.85rem;
  color: ${(props) => props.theme.lightText};
  font-family: "Victor Mono", monospace;
  margin-bottom: 0.5rem;
`;

const ExperienceList = styled.ul`
  margin-top: 1rem;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ExperienceItem = styled.li`
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${(props) => props.theme.secondaryText};
  position: relative;
  padding-left: 1.25rem;

  &::before {
    content: "▹";
    position: absolute;
    left: 0;
    color: ${(props) => props.theme.text};
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;
    line-height: 1.5;
  }
`;

const RoleBadge = styled.span`
  display: inline-block;
  color: #2196f3;
  background: rgba(33, 150, 243, 0.1);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  border: 1px solid #2196f3;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  margin: 0 0.25rem;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    display: inline-block;
    margin: 0.1rem 0.2rem;
  }
`;

const SkillsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    gap: 1.2rem;
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const SkillGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const SkillList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;

  @media (max-width: 768px) {
    gap: 0.6rem;
  }
`;

const SkillBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${(props) => props.theme.cardBg};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${(props) => props.theme.text};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${(props) => props.theme.secondaryText};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  svg {
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    padding: 0.45rem 0.85rem;
    font-size: 0.85rem;
    gap: 0.4rem;

    svg {
      font-size: 1rem;
    }
  }
`;

const AboutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8rem;
  align-items: flex-start;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 4rem;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const TechnicalSkillsTitle = styled.h2`
  font-family: "Victor Mono", monospace;
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &::after {
    content: "";
    height: 1px;
    flex-grow: 1;
    background: ${(props) => props.theme.border};
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
    gap: 0.5rem;
  }
`;

const AboutMe = () => {
  const aboutRef = useNav("About");

  return (
    <StyledAboutSection id="aboutContainer" ref={aboutRef}>
      <Fade direction="up" cascade damping={0.05} triggerOnce>
        <AboutGrid>
          <Column>
            <SectionHeader>
              <SectionTitle>About Me</SectionTitle>
              <ExperienceList>
                <ExperienceItem>
                  Frontend React.js Developer with 3+ years of experience
                  building scalable, high-performance web applications using
                  React.js, Next.js, and modern JavaScript.
                </ExperienceItem>
                <ExperienceItem>
                  Experienced in developing CRM and Inventory Management Systems
                  with dynamic dashboards, complex UI workflows, and data-driven
                  architectures. Strong focus on performance optimization,
                  reusable component design, and building scalable frontend
                  systems.
                </ExperienceItem>
                <ExperienceItem>
                  Currently seeking{" "}
                  <RoleBadge>Frontend React Developer</RoleBadge> roles in
                  product-driven environments where I can contribute to building
                  impactful, user-centric applications and grow as a product
                  engineer.
                </ExperienceItem>
                <ExperienceItem>
                  Passionate about clean code, problem-solving, and continuously
                  improving to deliver efficient, maintainable, and high-quality
                  software.
                </ExperienceItem>
              </ExperienceList>
            </SectionHeader>

            <SectionHeader>
              <SectionTitle>Work Experience</SectionTitle>
              <Timeline>
                <TimelineItem>
                  <TimelineHeader>
                    <CompanyLogoActive
                      src="images/spellor-logic-soft-logo.jpeg"
                      alt="Spellor Logic Soft"
                      loading="lazy"
                      width="60"
                      height="60"
                    />
                    <TimelineInfo>
                      <Role>Software Engineer</Role>
                      <CompanyName>
                        Spellor Logic Soft Pvt Ltd, Hyderabad
                      </CompanyName>
                      <DurationText>Jan 2024 - Present</DurationText>
                    </TimelineInfo>
                  </TimelineHeader>
                  <ExperienceList>
                    <ExperienceItem>
                      Developed scalable and responsive CRM web applications
                      using React.js, improving user workflows and data
                      management efficiency.
                    </ExperienceItem>
                    <ExperienceItem>
                      Built reusable UI components, custom hooks, and modular
                      architecture to enhance maintainability and development
                      speed.
                    </ExperienceItem>
                    <ExperienceItem>
                      Designed dynamic dashboards with data visualization and
                      role-based access control for better business insights.
                    </ExperienceItem>
                    <ExperienceItem>
                      Integrated REST APIs and implemented JWT authentication
                      for secure, real-time frontend–backend communication.
                    </ExperienceItem>
                    <ExperienceItem>
                      Optimized performance using lazy loading, memoization
                      (React.memo, useMemo), and code splitting.
                    </ExperienceItem>
                    <ExperienceItem>
                      Contributed to backend development (~20%) using Node.js
                      and Express.js, while ensuring responsive, cross-browser
                      compatible UI.
                    </ExperienceItem>
                  </ExperienceList>
                </TimelineItem>

                <TimelineItem>
                  <TimelineHeader>
                    <CompanyLogo
                      src="images/the-works-logo.png"
                      alt="THE WORKS"
                      loading="lazy"
                      width="60"
                      height="60"
                    />
                    <TimelineInfo>
                      <Role>Web Developer</Role>
                      <CompanyName>THE WORKS, Mumbai</CompanyName>
                      <DurationText>July 2023 - Dec 2023</DurationText>
                    </TimelineInfo>
                  </TimelineHeader>
                  <ExperienceList>
                    <ExperienceItem>
                      Developed responsive, multi-page web applications using
                      HTML, CSS, and JavaScript (ES6+), ensuring cross-browser
                      compatibility and improved UI/UX.
                    </ExperienceItem>
                    <ExperienceItem>
                      Built interactive and animated user interfaces using
                      Vanilla JavaScript and GSAP, enhancing user engagement.
                    </ExperienceItem>
                    <ExperienceItem>
                      Created reusable frontend components and optimized DOM
                      manipulation and rendering for better performance.
                    </ExperienceItem>
                    <ExperienceItem>
                      Integrated RESTful APIs and utilized React.js for dynamic
                      data handling and scalable features.
                    </ExperienceItem>
                    <ExperienceItem>
                      Collaborated with clients to gather requirements and
                      delivered user-friendly web solutions using Shopify and
                      Wix.
                    </ExperienceItem>
                  </ExperienceList>
                </TimelineItem>

                <TimelineItem>
                  <Role>Full Stack Developer Intern</Role>
                  <CompanyName>DevTown</CompanyName>
                  <DurationText>Nov 2022 - Feb 2023</DurationText>
                </TimelineItem>
              </Timeline>
            </SectionHeader>
          </Column>

          <Column>
            <SectionHeader>
              <TechnicalSkillsTitle>Technical Skills</TechnicalSkillsTitle>
              <SkillsSection>
                <SkillGroup>
                  <SkillList>
                    <SkillBadge>
                      <SiJavascript color="#F7DF1E" /> JS
                    </SkillBadge>
                    <SkillBadge>
                      <SiTypescript color="#3178C6" /> TS
                    </SkillBadge>
                    <SkillBadge>
                      <SiCplusplus color="#00599C" /> C++
                    </SkillBadge>
                    <SkillBadge>
                      <FaDatabase color="#4479A1" /> SQL
                    </SkillBadge>
                  </SkillList>
                </SkillGroup>

                <SkillGroup>
                  <SkillList>
                    <SkillBadge>
                      <FaReact color="#61DAFB" /> React
                    </SkillBadge>
                    <SkillBadge>
                      <SiNextdotjs color="currentColor" /> Next.js
                    </SkillBadge>
                    <SkillBadge>
                      <SiRedux color="#764ABC" /> Redux
                    </SkillBadge>
                    <SkillBadge>
                      <SiHtml5 color="#E34F26" /> HTML
                    </SkillBadge>
                    <SkillBadge>
                      <SiCss3 color="#1572B6" /> CSS
                    </SkillBadge>
                    <SkillBadge>
                      <SiTailwindcss color="#06B6D4" /> Tailwind
                    </SkillBadge>
                    <SkillBadge>
                      <SiSass color="#CC6699" /> SCSS
                    </SkillBadge>
                  </SkillList>
                </SkillGroup>

                <SkillGroup>
                  <SkillList>
                    <SkillBadge>
                      <FaNodeJs color="#339933" /> Node
                    </SkillBadge>
                    <SkillBadge>
                      <SiExpress color="currentColor" /> Express
                    </SkillBadge>
                    <SkillBadge>
                      <SiMongodb color="#47A248" /> MongoDB
                    </SkillBadge>
                    <SkillBadge>
                      <SiMysql color="#4479A1" /> MySQL
                    </SkillBadge>
                    <SkillBadge>
                      <SiPostgresql color="#4169E1" /> Postgres
                    </SkillBadge>
                  </SkillList>
                </SkillGroup>

                <SkillGroup>
                  <SkillList>
                    <SkillBadge>
                      <FaGitAlt color="#F05032" /> Git
                    </SkillBadge>
                    <SkillBadge>
                      <SiPostman color="#FF6C37" /> Postman
                    </SkillBadge>
                    <SkillBadge>
                      <SiVercel color="currentColor" /> Vercel
                    </SkillBadge>
                    <SkillBadge>
                      <SiNetlify color="#00C7B7" /> Netlify
                    </SkillBadge>
                    <SkillBadge>
                      <FaPlug color="#00C7B7" /> REST APIs
                    </SkillBadge>
                  </SkillList>
                </SkillGroup>
              </SkillsSection>
            </SectionHeader>
          </Column>
        </AboutGrid>
      </Fade>
    </StyledAboutSection>
  );
};

export default AboutMe;
