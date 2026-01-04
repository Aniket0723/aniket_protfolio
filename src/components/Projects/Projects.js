import React from "react";
import styled from "styled-components/macro";
import { useNav } from "../../hooks/useNav";
import { FeaturedProjectsList } from "../assets/projects";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

const StyledProjectsSection = styled.section`
  color: ${(props) => props.theme.text};
  padding: 0 1rem 6rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-family: "Syne", sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 3rem;
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

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

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
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const ProjectImage = styled.div`
  width: 100%;
  height: 180px;
  overflow: hidden;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: none !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  -webkit-filter: none !important;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  -webkit-tap-highlight-color: transparent;
  background-color: transparent !important;
`;

const ProjectContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ProjectTitleLink = styled.a`
  font-family: "Syne", sans-serif;
  font-size: 1.15rem;
  font-weight: 500;
  color: ${(props) => props.theme.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: 0.01em;

  &:hover {
    color: ${(props) => props.theme.secondaryText};
  }
`;

const ProjectLinks = styled.div`
  display: flex;
  gap: 1rem;

  a {
    font-size: 1.1rem;
    color: ${(props) => props.theme.lightText};
    transition: color 0.2s ease;

    &:hover {
      color: ${(props) => props.theme.text};
    }
  }
`;

const ProjectDescription = styled.p`
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${(props) => props.theme.secondaryText};
  margin-bottom: 1.5rem;
  flex-grow: 1;
`;

const ProjectFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TechStack = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const TechItem = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${(props) => props.theme.lightText};
  font-family: "Roboto Mono", monospace;
`;

const ViewProject = styled.a`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  display: flex;
  align-items: center;
  gap: 0.4rem;

  svg {
    font-size: 0.8rem;
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: translateX(3px);
  }
`;

const Projects = () => {
  const projectsRef = useNav("Projects");

  return (
    <StyledProjectsSection id="projectsContainer" ref={projectsRef}>
      <SectionTitle>Featured Projects</SectionTitle>
      <ProjectGrid>
        {FeaturedProjectsList.map((project) => (
          <ProjectCard key={project.id}>
            <ProjectImage>
              <StyledImage src={project.img} alt={project.title} />
            </ProjectImage>
            <ProjectContent>
              <ProjectHeader>
                <ProjectTitleLink
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                >
                  {project.title}
                </ProjectTitleLink>
                <ProjectLinks>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    title="Source Code"
                  >
                    <FaGithub />
                  </a>
                </ProjectLinks>
              </ProjectHeader>

              <ProjectDescription>{project.description}</ProjectDescription>

              <ProjectFooter>
                <TechStack>
                  {project.languages.slice(0, 3).map((lang) => (
                    <TechItem key={lang}>{lang}</TechItem>
                  ))}
                </TechStack>
                <ViewProject
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Project <FaExternalLinkAlt />
                </ViewProject>
              </ProjectFooter>
            </ProjectContent>
          </ProjectCard>
        ))}
      </ProjectGrid>
    </StyledProjectsSection>
  );
};

export default Projects;
