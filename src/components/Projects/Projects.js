import React from "react";
import styled from "styled-components/macro";
import { useNav } from "../../hooks/useNav";
import { FeaturedProjectsList } from "../assets/projects";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const StyledProjectsSection = styled.section`
  color: ${(props) => props.theme.text};
  padding: 0 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0 1.25rem 2rem;
  }
`;

const SectionTitle = styled.h2`
  font-family: "Victor Mono", monospace;
  font-size: 1.6rem;
  font-weight: 700;
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

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 320px);
  gap: 3rem;
  justify-content: center;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 320px);
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
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    border-color: ${(props) => props.theme.secondaryText};
  }
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

const ProjectImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 110px;
  overflow: hidden;
`;

const DateBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  font-family: "Victor Mono", monospace;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
`;

const ViewBadge = styled.a`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  font-family: "Victor Mono", monospace;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
  z-index: 2;

  svg {
    font-size: 0.55rem;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const ProjectContent = styled.div`
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
`;

const ProjectHeader = styled.div`
  margin-bottom: 0.4rem;
`;

const ProjectTitleLink = styled.a`
  font-family: "Victor Mono", monospace;
  font-size: 0.8rem;
  font-weight: 500;
  color: ${(props) => props.theme.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  &:hover {
    color: ${(props) => props.theme.secondaryText};
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ProjectDescription = styled.p`
  font-size: 0.6rem;
  line-height: 1.4;
  color: ${(props) => props.theme.secondaryText};
  margin-bottom: 0;
  flex-grow: 1;
`;

const Projects = () => {
  const projectsRef = useNav("Projects");
  const navigate = useNavigate();

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <StyledProjectsSection id="projectsContainer" ref={projectsRef}>
      <SectionTitle>Featured Projects</SectionTitle>
      <ProjectGrid>
        {FeaturedProjectsList.map((project) => {
          // Get the first image from images array or use img field
          const projectImage = project.images?.[0] || project.img;

          return (
            <ProjectCard
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
            >
              <ProjectImageContainer>
                {projectImage && (
                  <StyledImage
                    src={projectImage}
                    alt={project.title}
                    loading="lazy"
                    width="400"
                    height="150"
                  />
                )}
                <DateBadge>
                  {project.startMonth} - {project.endMonth} {project.year}
                </DateBadge>
                <ViewBadge
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  View <FaExternalLinkAlt />
                </ViewBadge>
              </ProjectImageContainer>

              <ProjectContent>
                <ProjectHeader>
                  <ProjectTitleLink
                    href={project.live}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {project.title}
                  </ProjectTitleLink>
                </ProjectHeader>

                <ProjectDescription>{project.description}</ProjectDescription>
              </ProjectContent>
            </ProjectCard>
          );
        })}
      </ProjectGrid>
    </StyledProjectsSection>
  );
};

export default Projects;
