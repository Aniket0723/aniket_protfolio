import React, { useState } from "react";
import styled from "styled-components/macro";
import { OtherProjects } from "../assets/projects";
import { Fade } from "react-awesome-reveal";
import { FaGithub, FaExternalLinkAlt, FaFolder } from "react-icons/fa";

const StyledMoreProjectsSection = styled.section`
  color: ${(props) => props.theme.text};
  padding: 2rem 1rem 3rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h3`
  font-family: "Syne", sans-serif;
  font-size: 2.8rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 3rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProjectCard = styled.div`
  background: ${(props) => props.theme.cardBg};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  svg.folder {
    font-size: 1.8rem;
    color: ${(props) => props.theme.lightText};
    opacity: 0.8;
  }
`;

const Links = styled.div`
  display: flex;
  gap: 1rem;

  a {
    font-size: 1.25rem;
    color: ${(props) => props.theme.lightText};
    transition: color 0.2s ease;

    &:hover {
      color: ${(props) => props.theme.text};
    }
  }
`;

const Title = styled.h4`
  font-family: "Syne", sans-serif;
  font-size: 1.4rem;
  font-weight: 500;
  color: ${(props) => props.theme.text};
  margin-bottom: 0.5rem;
  letter-spacing: 0.01em;
`;

const Description = styled.p`
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${(props) => props.theme.secondaryText};
  margin-bottom: 1.5rem;
  flex-grow: 1;
`;

const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const TechItem = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${(props) => props.theme.lightText};
  font-family: "Roboto Mono", monospace;
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 4rem auto 0;
  padding: 0.75rem 2rem;
  background: ${(props) => props.theme.buttonColor};
  color: ${(props) => props.theme.buttonText};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const MoreProjects = () => {
  const [visible, setVisible] = useState(3);

  const showMoreProjects = () => {
    if (visible < OtherProjects.length) setVisible((prev) => prev + 3);
    else setVisible(3);
  };

  return (
    <StyledMoreProjectsSection>
      <Fade direction="up" triggerOnce>
        <SectionTitle>Other Projects</SectionTitle>
        <CardGrid>
          {OtherProjects.slice(0, visible).map((project) => (
            <ProjectCard key={project.id}>
              <CardHeader>
                <FaFolder className="folder" />
                <Links>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    title="Source Code"
                  >
                    <FaGithub />
                  </a>
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noreferrer"
                      title="Live Site"
                    >
                      <FaExternalLinkAlt />
                    </a>
                  )}
                </Links>
              </CardHeader>

              <Title>{project.title}</Title>
              <Description>{project.description}</Description>

              <TechStack>
                {project.languages.map((lang) => (
                  <TechItem key={lang}>{lang}</TechItem>
                ))}
              </TechStack>
            </ProjectCard>
          ))}
        </CardGrid>

        {OtherProjects.length > 3 && (
          <LoadMoreButton onClick={showMoreProjects}>
            {visible >= OtherProjects.length ? "Show Less" : "Show More"}
          </LoadMoreButton>
        )}
      </Fade>
    </StyledMoreProjectsSection>
  );
};

export default MoreProjects;
