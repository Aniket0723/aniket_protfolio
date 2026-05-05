import React, { useEffect } from "react";
import styled from "styled-components/macro";
import { useParams, useNavigate } from "react-router-dom";
import { blogPosts } from "../assets/blogs";
import { FaArrowLeft, FaAws } from "react-icons/fa";
import {
  SiNodedotjs,
  SiNextdotjs,
  SiReact,
  SiJavascript,
  SiTypescript,
  SiCss3,
  SiMongodb,
  SiPostgresql,
} from "react-icons/si";

/* ─── Layout ─────────────────────────────────────────────────────────────── */

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

/* ─── Back button — identical to ProjectDetail ───────────────────────────── */

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

/* ─── Post header ────────────────────────────────────────────────────────── */

const PostHeader = styled.div`
  margin-bottom: 3rem;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  background: ${(props) => props.theme.border};
  color: ${(props) => props.theme.secondaryText};
  font-family: "Victor Mono", monospace;
  letter-spacing: 0.03em;

  svg {
    font-size: 0.85rem;
    color: ${(props) => props.iconColor || "inherit"};
  }
`;

const tagIconMap = {
  AWS: { icon: <FaAws />, color: "#FF9900" },
  S3: { icon: <FaAws />, color: "#FF9900" },
  CloudFront: { icon: <FaAws />, color: "#FF9900" },
  "Node.js": { icon: <SiNodedotjs />, color: "#339933" },
  "Next.js": { icon: <SiNextdotjs />, color: "currentColor" },
  React: { icon: <SiReact />, color: "#61DAFB" },
  JavaScript: { icon: <SiJavascript />, color: "#F7DF1E" },
  TypeScript: { icon: <SiTypescript />, color: "#3178C6" },
  CSS: { icon: <SiCss3 />, color: "#1572B6" },
  MongoDB: { icon: <SiMongodb />, color: "#47A248" },
  PostgreSQL: { icon: <SiPostgresql />, color: "#4169E1" },
};

/* Title — normal body font, bold */
const PostTitle = styled.h1`
  font-family: "Victor Mono", monospace;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

/* Date and read time — simple text above title */
const PostMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
`;

const MetaText = styled.span`
  font-size: 0.85rem;
  color: ${(props) => props.theme.lightText};
  font-family: "Victor Mono", monospace;
`;

/* Subtitle — same as ProjectSubject */
const PostSubtitle = styled.h2`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${(props) => props.theme.secondaryText};
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

/* ─── Content sections — same as ProjectDetail Section / SectionTitle ────── */

const Section = styled.section`
  margin-bottom: 3rem;
`;

/* SectionTitle — simple bold for blog headings */
const SectionTitle = styled.h3`
  font-family: "Victor Mono", monospace;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: ${(props) => props.theme.text};
  text-transform: uppercase;
  letter-spacing: 0.03em;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
`;

/* SectionContent — identical to ProjectDetail */
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

  h2 {
    font-family: "Victor Mono", monospace;
    font-size: 1rem;
    font-weight: 700;
    color: ${(props) => props.theme.text};
    margin: 2rem 0 0.75rem;
  }

  h3 {
    font-family: "Victor Mono", monospace;
    font-size: 0.9rem;
    font-weight: 700;
    color: ${(props) => props.theme.text};
    margin: 1.5rem 0 0.5rem;
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

  ol {
    counter-reset: ol-counter;

    li {
      counter-increment: ol-counter;

      &::before {
        content: counter(ol-counter) ".";
        font-size: 0.9rem;
        font-weight: 700;
        color: ${(props) => props.theme.secondaryText};
      }
    }
  }

  strong {
    color: ${(props) => props.theme.text};
    font-weight: 600;
  }

  em {
    font-style: italic;
  }

  code {
    font-family: "Victor Mono", monospace;
    font-size: 0.85em;
    background: #1e1e2e;
    color: #cdd6f4;
    padding: 0.15em 0.4em;
    border-radius: 4px;
  }

  pre {
    background: #1e1e2e;
    border: 1px solid #313244;
    border-radius: 8px;
    padding: 1.5rem;
    overflow-x: auto;
    margin: 1.5rem 0;

    code {
      background: transparent;
      padding: 0;
      font-size: 0.875rem;
      line-height: 1.8;
      color: #cdd6f4;
    }

    @media (max-width: 768px) {
      padding: 1rem;
    }
  }

  blockquote {
    border-left: 3px solid ${(props) => props.theme.secondaryText};
    margin: 1.5rem 0;
    padding: 0.75rem 1.25rem;
    background: ${(props) => props.theme.cardBg};
    border-radius: 0 6px 6px 0;
    font-style: italic;

    p {
      margin-bottom: 0;
    }
  }

  hr {
    border: none;
    border-top: 1px solid ${(props) => props.theme.border};
    margin: 2.5rem 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    font-size: 0.9rem;
    overflow-x: auto;
    display: block;
  }

  th {
    background: ${(props) => props.theme.cardBg};
    color: ${(props) => props.theme.text};
    font-weight: 600;
    text-align: left;
    padding: 0.65rem 1rem;
    border: 1px solid ${(props) => props.theme.border};
    white-space: nowrap;
  }

  td {
    padding: 0.6rem 1rem;
    border: 1px solid ${(props) => props.theme.border};
    color: ${(props) => props.theme.secondaryText};
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background: ${(props) => props.theme.cardBg};
  }

  @media (max-width: 768px) {
    th,
    td {
      padding: 0.5rem 0.65rem;
      font-size: 0.8rem;
    }
  }
`;

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
`;

/* ─── Markdown parser ────────────────────────────────────────────────────── */

const parseMarkdown = (text) => {
  const lines = text.split("\n");
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trim().startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      result.push(
        <pre key={`pre-${i}`}>
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---") {
      result.push(<hr key={`hr-${i}`} />);
      i++;
      continue;
    }

    // H2 → rendered as SectionTitle-style heading
    if (line.startsWith("## ")) {
      result.push(<h2 key={`h2-${i}`}>{renderInline(line.slice(3))}</h2>);
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      result.push(<h3 key={`h3-${i}`}>{renderInline(line.slice(4))}</h3>);
      i++;
      continue;
    }

    // Blockquote
    if (line.trim().startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      result.push(
        <blockquote key={`bq-${i}`}>
          <p>{renderInline(quoteLines.join(" "))}</p>
        </blockquote>,
      );
      continue;
    }

    // Table
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableLines = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length >= 2) {
        const parseRow = (row) =>
          row
            .trim()
            .slice(1, -1)
            .split("|")
            .map((cell) => cell.trim());

        const headers = parseRow(tableLines[0]);
        const rows = tableLines.slice(2).map(parseRow);

        result.push(
          <table key={`table-${i}`}>
            <thead>
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx}>{renderInline(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>,
        );
      }
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const text = lines[i].trim().replace(/^\d+\.\s/, "");
        items.push(<li key={`oli-${i}`}>{renderInline(text)}</li>);
        i++;
      }
      result.push(<ol key={`ol-${i}`}>{items}</ol>);
      continue;
    }

    // Unordered list
    if (line.trim().startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(
          <li key={`uli-${i}`}>{renderInline(lines[i].trim().slice(2))}</li>,
        );
        i++;
      }
      result.push(<ul key={`ul-${i}`}>{items}</ul>);
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    result.push(<p key={`p-${i}`}>{renderInline(line)}</p>);
    i++;
  }

  return result;
};

const renderInline = (text) => {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={match.index}>{match[3]}</em>);
    } else if (match[4]) {
      parts.push(<code key={match.index}>{match[4]}</code>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
};

/* ─── Component ──────────────────────────────────────────────────────────── */

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find((p) => p.id === id);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} — Aniket`;
    }
    return () => {
      document.title = "Aniket";
    };
  }, [post]);

  if (!post) {
    return (
      <NotFoundContainer>
        <PostTitle>Post Not Found</PostTitle>
        <BackButton
          onClick={() => navigate("/learn")}
          style={{ marginTop: "2rem" }}
        >
          <FaArrowLeft /> Back to Learn
        </BackButton>
      </NotFoundContainer>
    );
  }

  // Split content into sections by ## headings
  const sections = [];
  const lines = post.content.split("\n");
  let currentTitle = null;
  let currentLines = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentLines.length > 0) {
        sections.push({ title: currentTitle, body: currentLines.join("\n") });
      }
      currentTitle = line.slice(3).trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  if (currentLines.length > 0) {
    sections.push({ title: currentTitle, body: currentLines.join("\n") });
  }

  return (
    <DetailContainer>
      <BackButton onClick={() => navigate("/learn")}>
        <FaArrowLeft /> Back to Learn
      </BackButton>

      <PostHeader>
        <TagRow>
          {post.tags.map((tag) => {
            const match = tagIconMap[tag];
            return (
              <Tag key={tag} iconColor={match?.color}>
                {match?.icon}
                {tag}
              </Tag>
            );
          })}
        </TagRow>

        <PostMeta>
          <MetaText>{post.date}</MetaText>
          <MetaText>{post.readTime}</MetaText>
        </PostMeta>

        <PostTitle>{post.title}</PostTitle>
        <PostSubtitle>{post.summary}</PostSubtitle>
      </PostHeader>

      {sections.map((section, idx) => (
        <Section key={idx}>
          {section.title && <SectionTitle>{section.title}</SectionTitle>}
          <SectionContent>{parseMarkdown(section.body)}</SectionContent>
        </Section>
      ))}
    </DetailContainer>
  );
};

export default BlogPost;
