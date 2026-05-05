import React from "react";
import styled from "styled-components/macro";
import { useNavigate } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import { blogPosts } from "../assets/blogs";

const StyledLearnSection = styled.section`
  color: ${(props) => props.theme.text};
  padding: 3rem 4rem 6rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem 4rem;
  }
`;

const SectionTitle = styled.h2`
  font-family: "Victor Mono", monospace;
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
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
  }
`;

const SectionSubtitle = styled.p`
  font-size: 0.875rem;
  color: ${(props) => props.theme.secondaryText};
  margin-bottom: 3rem;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 2rem;
  }
`;

const BlogGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BlogCard = styled.div`
  background: ${(props) => props.theme.cardBg};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.5rem;
  align-items: start;

  &:hover {
    transform: translateY(-2px);
    border-color: ${(props) => props.theme.secondaryText};
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 0.75rem;
  }
`;

const BlogLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const BlogTitle = styled.h3`
  font-family: "Victor Mono", monospace;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  line-height: 1.3;
  transition: color 0.2s ease;

  ${BlogCard}:hover & {
    color: ${(props) => props.theme.secondaryText};
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const BlogSummary = styled.p`
  font-size: 0.8rem;
  line-height: 1.65;
  color: ${(props) => props.theme.secondaryText};

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const BlogMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const MetaText = styled.span`
  font-size: 0.72rem;
  color: ${(props) => props.theme.lightText};
  font-family: "Victor Mono", monospace;
  white-space: nowrap;
`;

const ReadMore = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  margin-top: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1rem;
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 20px;
  background: ${(props) => props.theme.cardBg};
  transition: all 0.2s ease;
  white-space: nowrap;

  ${BlogCard}:hover & {
    background: ${(props) => props.theme.border};
    gap: 0.7rem;
  }

  @media (max-width: 768px) {
    margin-top: 0;
  }
`;

const PostNumber = styled.span`
  font-family: "Victor Mono", monospace;
  font-size: 0.7rem;
  font-weight: 700;
  color: ${(props) => props.theme.lightText};
  letter-spacing: 0.05em;
`;

const Learn = () => {
  const navigate = useNavigate();

  return (
    <StyledLearnSection id="learnContainer">
      <Fade direction="up" cascade damping={0.05} triggerOnce>
        <SectionTitle>Learn</SectionTitle>
        <SectionSubtitle>
          Things I've learned, figured out, or had to look up twice. Written
          down so I don't forget — and maybe useful to you too.
        </SectionSubtitle>

        <BlogGrid>
          {blogPosts.map((post, idx) => (
            <BlogCard
              key={post.id}
              onClick={() => navigate(`/learn/${post.id}`)}
            >
              <BlogLeft>
                <PostNumber>{String(idx + 1).padStart(2, "0")}</PostNumber>
                <BlogTitle>{post.title}</BlogTitle>
                <BlogSummary>{post.summary}</BlogSummary>
              </BlogLeft>

              <BlogMeta>
                <MetaText>{post.date}</MetaText>
                <ReadMore>Read →</ReadMore>
              </BlogMeta>
            </BlogCard>
          ))}
        </BlogGrid>
      </Fade>
    </StyledLearnSection>
  );
};

export default Learn;
