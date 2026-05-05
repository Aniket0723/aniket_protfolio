import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components/macro";
import { FeaturedProjectsList } from "../assets/projects";
import {
  FaGithub,
  FaExternalLinkAlt,
  FaArrowLeft,
  FaLinkedin,
} from "react-icons/fa";
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

const DetailContainer = styled.div`
  color: ${(props) => props.theme.text};
  padding: 1.5rem 1rem 4rem;
  max-width: 1000px;
  margin: 0 auto;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 1rem 1.25rem 2rem;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: ${(props) => props.theme.cardBg};
  border: 1px solid ${(props) => props.theme.border};
  color: ${(props) => props.theme.text};
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  transition: all 0.2s ease;

  svg {
    font-size: 0.75rem;
  }

  &:hover {
    background: ${(props) => props.theme.border};
    transform: translateX(-4px);
  }
`;

const ProjectHeader = styled.div`
  margin-bottom: 3rem;
`;

const ProjectImageWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 2rem;
`;

const GalleryContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.border};
`;

const GallerySlider = styled.div`
  display: flex;
  transition: transform 0.3s ease-in-out;
  transform: translateX(-${(props) => props.currentSlide * 100}%);
`;

const GallerySlide = styled.div`
  min-width: 100%;
  position: relative;
`;

const ProjectImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;

  @media (max-width: 768px) {
    height: 250px;
  }
`;

const DotsContainer = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  backdrop-filter: blur(4px);

  @media (max-width: 768px) {
    bottom: 0.75rem;
    right: 0.75rem;
    gap: 0.4rem;
    padding: 0.4rem 0.8rem;
  }
`;

const Dot = styled.button`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
  background: ${(props) => (props.active ? "white" : "transparent")};
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.7);
  }

  @media (max-width: 768px) {
    width: 8px;
    height: 8px;
  }
`;

const ImageTechStack = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  max-width: calc(100% - 24px);

  @media (max-width: 768px) {
    bottom: 8px;
    left: 8px;
    gap: 0.4rem;
    max-width: calc(100% - 16px);
  }
`;

const ImageTechBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  color: white;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid ${(props) => props.color || "rgba(255, 255, 255, 0.2)"};

  svg {
    font-size: 0.9rem;
    color: ${(props) => props.color || "white"};
  }

  @media (max-width: 768px) {
    font-size: 0;
    padding: 0.4rem;
    gap: 0;

    svg {
      font-size: 1rem;
    }
  }
`;

const ProjectTitle = styled.h1`
  font-family: "Victor Mono", monospace;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const ProjectSubject = styled.h2`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${(props) => props.theme.secondaryText};
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const ProjectMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: ${(props) => props.theme.cardBg};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 8px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1.5rem;
  }
`;

const MetaItem = styled.div`
  text-align: center;

  .label {
    font-size: 0.75rem;
    color: ${(props) => props.theme.lightText};
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 0.5rem;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 0.9rem;
    color: ${(props) => props.theme.text};
    font-weight: 600;

    &.status-active {
      color: #4caf50;
      background: rgba(76, 175, 80, 0.1);
      padding: 0.3rem 0.6rem;
      border-radius: 4px;
      border: 1px solid #4caf50;
      display: inline-block;
      font-size: 0.8rem;
      white-space: nowrap;
    }

    &.status-production {
      color: #2196f3;
      background: rgba(33, 150, 243, 0.1);
      padding: 0.3rem 0.6rem;
      border-radius: 4px;
      border: 1px solid #2196f3;
      display: inline-block;
      font-size: 0.8rem;
      white-space: nowrap;
    }

    &.status-completed {
      color: ${(props) => props.theme.text};
    }
  }
`;

const Links = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 0.5rem;
  z-index: 11;

  a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.85rem;
    transition: all 0.2s ease;
    backdrop-filter: blur(8px);

    &.live-demo {
      background: rgba(0, 0, 0, 0.75);
      color: white;
      border: 1px solid #4caf50;

      svg {
        color: #4caf50;
      }

      &:hover {
        background: rgba(0, 0, 0, 0.85);
        transform: translateY(-2px);
      }
    }

    &.source-code {
      background: rgba(0, 0, 0, 0.75);
      color: white;
      border: 1px solid #2196f3;

      svg {
        color: #2196f3;
      }

      &:hover {
        background: rgba(0, 0, 0, 0.85);
        transform: translateY(-2px);
      }
    }

    svg {
      font-size: 1rem;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.4rem;

    a {
      padding: 0.5rem 0.8rem;
      font-size: 0.75rem;

      svg {
        font-size: 0.9rem;
      }
    }
  }
`;

const TeamSection = styled.div`
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: ${(props) => props.theme.cardBg};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    padding: 1.2rem;
    margin-bottom: 2rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

const TeamTitle = styled.h3`
  font-family: "Victor Mono", monospace;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0;
  color: ${(props) => props.theme.text};
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }
`;

const TeamMembers = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const TeamMember = styled.a`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: ${(props) => props.theme.bg};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 6px;
  color: ${(props) => props.theme.text};
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;

  svg {
    color: #0077b5;
    font-size: 0.95rem;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: #0077b5;
    box-shadow: 0 4px 8px rgba(0, 119, 181, 0.2);
  }
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h3`
  font-family: "Victor Mono", monospace;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  text-decoration: underline;
  text-decoration-color: ${(props) => props.theme.secondaryText};
  text-decoration-thickness: 2px;
  text-underline-offset: 8px;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
`;

const SectionContent = styled.div`
  color: ${(props) => props.theme.secondaryText};
  line-height: 1.8;
  font-size: 0.875rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    line-height: 1.7;
  }

  p {
    margin-bottom: 1rem;
  }

  ul,
  ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
    list-style: none;

    @media (max-width: 768px) {
      margin-left: 1rem;
    }

    li {
      margin-bottom: 0.5rem;
      position: relative;
      padding-left: 1.5rem;

      @media (max-width: 768px) {
        padding-left: 1.2rem;
      }

      &::before {
        content: "•";
        position: absolute;
        left: 0;
        color: ${(props) => props.theme.secondaryText};
        font-weight: bold;
        font-size: 1.2rem;
      }
    }
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
    "Express.js": "#000000",
    MongoDB: "#47A248",
    PostgreSQL: "#4169E1",
    "Neon PostgreSQL": "#4169E1",
    "Google Gemini AI": "#4285F4",
    HTML: "#E34F26",
    CSS: "#1572B6",
    SCSS: "#CC6699",
    Python: "#3776AB",
    Java: "#007396",
    "C++": "#00599C",
    Git: "#F05032",
    Docker: "#2496ED",
    AWS: "#FF9900",
    Firebase: "#FFCA28",
    GraphQL: "#E10098",
    Vue: "#4FC08D",
    "Vue.js": "#4FC08D",
    Angular: "#DD0031",
    Svelte: "#FF3E00",
    MySQL: "#4479A1",
    Redis: "#DC382D",
    Nginx: "#009639",
    Webpack: "#8DD6F9",
    Vite: "#646CFF",
    Jest: "#C21325",
    Cypress: "#17202C",
    "TMDB API": "#01D277",
  };
  return colorMap[techName] || "#6B7280";
};

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
`;

const ProjectDetail = ({ theme }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = FeaturedProjectsList.find((p) => p.id === parseInt(id));
  const [currentSlide, setCurrentSlide] = useState(0);

  // Support both single image (img) and multiple images (images array)
  const projectImages = project?.images || (project?.img ? [project.img] : []);
  const hasMultipleImages = projectImages.length > 1;

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Auto-play slider every 3 seconds
  React.useEffect(() => {
    if (!hasMultipleImages) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % projectImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [hasMultipleImages, projectImages.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (!project) {
    return (
      <NotFoundContainer>
        <ProjectTitle>Project Not Found</ProjectTitle>
        <BackButton onClick={() => navigate("/")} style={{ marginTop: "2rem" }}>
          <FaArrowLeft /> Back to Portfolio
        </BackButton>
      </NotFoundContainer>
    );
  }

  return (
    <DetailContainer>
      <BackButton
        onClick={() => {
          navigate("/");
          setTimeout(() => {
            const el = document.getElementById("projectsContainer");
            if (el) {
              const navbarHeight =
                document.querySelector("nav")?.offsetHeight || 65;
              const top =
                el.getBoundingClientRect().top +
                window.scrollY -
                navbarHeight -
                24;
              window.scrollTo({ top, behavior: "smooth" });
            }
          }, 150);
        }}
      >
        <FaArrowLeft /> Back to Projects
      </BackButton>

      <ProjectHeader>
        <ProjectTitle>{project.title}</ProjectTitle>
        <ProjectSubject>{project.subject}</ProjectSubject>

        {projectImages.length > 0 && (
          <ProjectImageWrapper>
            <GalleryContainer>
              <GallerySlider currentSlide={currentSlide}>
                {projectImages.map((image, index) => (
                  <GallerySlide key={index}>
                    <ProjectImage
                      src={image}
                      alt={`${project.title} - ${index + 1}`}
                      loading={index === 0 ? "eager" : "lazy"}
                      width="1000"
                      height="400"
                    />
                  </GallerySlide>
                ))}
              </GallerySlider>

              {project.languages && project.languages.length > 0 && (
                <ImageTechStack>
                  {project.languages.slice(0, 5).map((lang) => (
                    <ImageTechBadge key={lang} color={getTechColor(lang)}>
                      {getTechIcon(lang)}
                      {lang}
                    </ImageTechBadge>
                  ))}
                </ImageTechStack>
              )}

              {hasMultipleImages && (
                <DotsContainer>
                  {projectImages.map((_, index) => (
                    <Dot
                      key={index}
                      active={index === currentSlide}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </DotsContainer>
              )}
            </GalleryContainer>

            <Links>
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                  className="live-demo"
                >
                  <FaExternalLinkAlt /> Live
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="source-code"
                >
                  <FaGithub /> Code
                </a>
              )}
            </Links>
          </ProjectImageWrapper>
        )}

        <ProjectMeta>
          <MetaItem>
            <div className="label">Timeline</div>
            <div className="value">
              {project.startMonth} to {project.endMonth} {project.year}
            </div>
          </MetaItem>
          <MetaItem>
            <div className="label">Role</div>
            <div className="value">{project.role || "Full Stack"}</div>
          </MetaItem>
          <MetaItem>
            <div className="label">Team</div>
            <div className="value">{project.team || "Solo"}</div>
          </MetaItem>
          <MetaItem>
            <div className="label">Status</div>
            <div
              className={`value ${
                project.status === "In Active Development"
                  ? "status-active"
                  : project.status === "In Production"
                    ? "status-production"
                    : "status-completed"
              }`}
            >
              {project.status || "Completed"}
            </div>
          </MetaItem>
        </ProjectMeta>

        {project.client && (
          <ProjectMeta style={{ marginTop: "-1rem" }}>
            <MetaItem style={{ gridColumn: "1 / -1", textAlign: "left" }}>
              <div className="label">Client</div>
              <div className="value">{project.client}</div>
            </MetaItem>
          </ProjectMeta>
        )}

        {project.teamMembers && project.teamMembers.length > 0 && (
          <TeamSection>
            <TeamTitle>Team Members</TeamTitle>
            <TeamMembers>
              {project.teamMembers.map((member, idx) => (
                <TeamMember
                  key={idx}
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaLinkedin />
                  {member.name}
                </TeamMember>
              ))}
            </TeamMembers>
          </TeamSection>
        )}
      </ProjectHeader>

      {project.overview && (
        <Section>
          <SectionTitle>Overview</SectionTitle>
          <SectionContent
            dangerouslySetInnerHTML={{ __html: project.overview }}
          />
        </Section>
      )}

      {project.description && (
        <Section>
          <SectionTitle>Description</SectionTitle>
          <SectionContent>{project.description}</SectionContent>
        </Section>
      )}

      {project.whatCanUsersDo && (
        <Section>
          <SectionTitle>What Users Can Do</SectionTitle>
          <SectionContent>
            <ul>
              {project.whatCanUsersDo.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </SectionContent>
        </Section>
      )}

      {project.whyBuilt && (
        <Section>
          <SectionTitle>Why I Built This</SectionTitle>
          <SectionContent>
            <p>{project.whyBuilt}</p>
            {project.whyBuiltPoints && (
              <ul>
                {project.whyBuiltPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            )}
          </SectionContent>
        </Section>
      )}

      {project.impact && (
        <Section>
          <SectionTitle>After Launch & Impact</SectionTitle>
          <SectionContent>
            <ul>
              {project.impact.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </SectionContent>
        </Section>
      )}

      {project.futurePlans && (
        <Section>
          <SectionTitle>Future Plans</SectionTitle>
          <SectionContent>
            <ul>
              {project.futurePlans.map((plan, idx) => (
                <li key={idx}>{plan}</li>
              ))}
            </ul>
          </SectionContent>
        </Section>
      )}
    </DetailContainer>
  );
};

export default ProjectDetail;
