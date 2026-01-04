import React from "react";
import styled from "styled-components/macro";
import { useNav } from "../hooks/useNav";
import { Fade } from "react-awesome-reveal";
import { FaReact, FaNodeJs, FaGitAlt, FaDatabase } from "react-icons/fa";
import { AiOutlineApi } from "react-icons/ai";
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
  font-family: "Syne", sans-serif;
  font-size: 2.8rem;
  font-weight: 800;
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
`;

const Role = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
`;

const CompanyName = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.secondaryText};
  font-weight: 500;
`;

const DurationText = styled.span`
  font-size: 0.85rem;
  color: ${(props) => props.theme.lightText};
  font-family: "Roboto Mono", monospace;
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
`;

const SkillsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-top: 1rem;

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
  font-family: "Syne", sans-serif;
  font-size: 2.8rem;
  font-weight: 800;
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
`;

const AboutMe = () => {
  const aboutRef = useNav("About");

  return (
    <StyledAboutSection id="aboutContainer" ref={aboutRef}>
      <Fade direction="up" cascade damping={0.05} triggerOnce>
        <AboutGrid>
          <Column>
            <SectionHeader>
              <SectionTitle>Work Experience</SectionTitle>
              <Timeline>
                <TimelineItem>
                  <Role>Web Developer</Role>
                  <CompanyName>THE WORKS, Mumbai</CompanyName>
                  <DurationText>July 2023 - Dec 2023</DurationText>
                  <ExperienceList>
                    <ExperienceItem>
                      Designed and developed responsive web applications,
                      creating multi-page layouts and custom UI features.
                    </ExperienceItem>
                    <ExperienceItem>
                      Refactored a legacy application into React.js using Hooks,
                      Redux, and Material-UI, enhancing performance.
                    </ExperienceItem>
                    <ExperienceItem>
                      Built reusable components, custom React hooks, and
                      integrated REST APIs for scalable solutions.
                    </ExperienceItem>
                    <ExperienceItem>
                      Achieved a 30% reduction in downtime through regular
                      monitoring and troubleshooting.
                    </ExperienceItem>
                    <ExperienceItem>
                      Collaborated with clients to gather requirements and
                      ensured timely, high-quality delivery.
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
                      <SiNextdotjs /> Next.js
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
                      <SiExpress /> Express
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
                      <SiVercel /> Vercel
                    </SkillBadge>
                    <SkillBadge>
                      <SiNetlify color="#00C7B7" /> Netlify
                    </SkillBadge>
                    <SkillBadge>
                      <AiOutlineApi color="#00C7B7" /> REST APIs
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
