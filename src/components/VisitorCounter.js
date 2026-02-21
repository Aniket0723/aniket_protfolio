import React, { useState, useEffect } from "react";
import styled from "styled-components/macro";
import { FaEye } from "react-icons/fa";
import { Fade } from "react-awesome-reveal";

const CounterSection = styled.section`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 1rem 3rem;
  background: ${(props) => props.theme.body};
  margin-top: -4rem;

  @media (max-width: 768px) {
    padding: 0 1rem 2rem;
    margin-top: -2rem;
  }
`;

const CounterWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: ${(props) => props.theme.cardBg};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 8px;
  font-family: "Roboto Mono", monospace;
  font-size: 0.95rem;
  color: ${(props) => props.theme.secondaryText};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  svg {
    color: ${(props) => props.theme.text};
    font-size: 1.2rem;
  }

  .visitor-text {
    color: ${(props) => props.theme.lightText};
  }

  .visitor-number {
    color: ${(props) => props.theme.text};
    font-weight: 700;
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1.5rem;
    font-size: 0.85rem;
    gap: 0.5rem;
    flex-wrap: nowrap;
    white-space: nowrap;

    svg {
      font-size: 1rem;
    }

    .visitor-number {
      font-size: 0.95rem;
    }
  }

  @media (max-width: 480px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.8rem;

    svg {
      font-size: 0.9rem;
    }

    .visitor-number {
      font-size: 0.9rem;
    }
  }
`;

const VisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(null);

  useEffect(() => {
    const fetchVisitorCount = async () => {
      try {
        const response = await fetch(
          "https://api.countapi.xyz/hit/aniket-portfolio-2026/visits",
        );
        const data = await response.json();
        setVisitorCount(data.value);
      } catch (error) {
        console.error("Failed to fetch visitor count:", error);
        const localCount = localStorage.getItem("visitorCount") || "1";
        const newCount = parseInt(localCount) + 1;
        localStorage.setItem("visitorCount", newCount.toString());
        setVisitorCount(newCount);
      }
    };

    fetchVisitorCount();
  }, []);

  const formatNumber = (num) => {
    if (!num) return "...";
    return num.toLocaleString();
  };

  return (
    <CounterSection>
      <Fade direction="up" triggerOnce>
        <CounterWrapper>
          <FaEye />
          <span className="visitor-text">You are the</span>
          <span className="visitor-number">{formatNumber(visitorCount)}</span>
          <span className="visitor-text">visitor</span>
        </CounterWrapper>
      </Fade>
    </CounterSection>
  );
};

export default VisitorCounter;
