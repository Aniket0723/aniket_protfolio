import React from "react";
import styled from "styled-components/macro";
import { useNav } from "../../hooks/useNav";
import { FeaturedProjectsList } from "../assets/projects";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  SiReact,
  SiRedux,
  SiJavascript,
  SiTypescript,
  SiNextdotjs,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiPostgresql,
  SiSass,
  SiCss3,
} from "react-icons/si";

const StyledProjectsSection = styled.section`
  color: ${(props) => props.theme.text};
  padding: 0 1rem 6rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0 1.25rem 4rem;
  }
`;

const SectionTitle = styled.h2`
  font-family: "Syne", sans-serif;
  font-size: 2.8rem;
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

  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 2rem;
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
  height: 180px;
  overflow: hidden;
`;

const DateBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: "Roboto Mono", monospace;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.4rem 0.6rem;
  }
`;

const GithubBadge = styled.a`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
  z-index: 2;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 0.45rem;
  }
`;

const ProjectContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
`;

const ProjectHeader = styled.div`
  margin-bottom: 1rem;
`;

const ProjectTitleLink = styled.a`
  font-family: "Syne", sans-serif;
  font-size: 1.4rem;
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
    font-size: 1.2rem;
  }
`;

const ProjectDescription = styled.p`
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${(props) => props.theme.secondaryText};
  margin-bottom: 1.5rem;
  flex-grow: 1;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    line-height: 1.4;
  }
`;

const ProjectFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 400px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const TechStack = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
`;

const TechIcon = styled.span`
  font-size: 1.3rem;
  color: ${(props) => props.color || props.theme.lightText};
  display: flex;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.2);
  }

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const ViewProject = styled.a`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;

  svg {
    font-size: 0.8rem;
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: translateX(3px);
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const getTechIcon = (techName) => {
  const iconMap = {
    React: <SiReact />,
    "React.js": <SiReact />,
    Redux: <SiRedux />,
    "Redux Toolkit": <SiRedux />,
    JavaScript: <SiJavascript />,
    TypeScript: <SiTypescript />,
    "Next.js": <SiNextdotjs />,
    "Tailwind CSS": <SiTailwindcss />,
    "Node.js": <SiNodedotjs />,
    "Express.js": <SiExpress />,
    MongoDB: <SiMongodb />,
    PostgreSQL: <SiPostgresql />,
    "Neon PostgreSQL": <SiPostgresql />,
    SCSS: <SiSass />,
    CSS: <SiCss3 />,
  };
  return iconMap[techName] || null;
};

const getTechColor = (techName) => {
  const colorMap = {
    React: "#61DAFB",
    "React.js": "#61DAFB",
    Redux: "#764ABC",
    "Redux Toolkit": "#764ABC",
    JavaScript: "#F7DF1E",
    TypeScript: "#3178C6",
    "Next.js": "#FFFFFF",
    "Tailwind CSS": "#06B6D4",
    "Node.js": "#339933",
    "Express.js": "#FFFFFF",
    MongoDB: "#47A248",
    PostgreSQL: "#4169E1",
    "Neon PostgreSQL": "#4169E1",
    "NextAuth.js": "#FFFFFF",
    CSS: "#1572B6",
    SCSS: "#CC6699",
    "TMDB API": "#01D277",
  };
  return colorMap[techName] || "#6B7280";
};

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
        {FeaturedProjectsList.map((project) => (
          <ProjectCard
            key={project.id}
            onClick={() => handleProjectClick(project.id)}
          >
            <ProjectImageContainer>
              {project.img && (
                <StyledImage src={project.img} alt={project.title} />
              )}
              <GithubBadge
                href={project.github}
                target="_blank"
                rel="noreferrer"
                title="Source Code"
                onClick={(e) => e.stopPropagation()}
              >
                <FaGithub />
              </GithubBadge>
              <DateBadge>
                {project.startMonth} - {project.endMonth} {project.year}
              </DateBadge>
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

              <ProjectFooter>
                <TechStack>
                  {project.languages.slice(0, 4).map((lang) => (
                    <TechIcon
                      key={lang}
                      title={lang}
                      color={getTechColor(lang)}
                    >
                      {getTechIcon(lang)}
                    </TechIcon>
                  ))}
                </TechStack>
                <ViewProject
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  View <FaExternalLinkAlt />
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
