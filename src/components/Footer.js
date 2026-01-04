import React from "react";
import styled from "styled-components/macro";

const StyledFooter = styled.footer`
  padding: 2rem 1rem;
  text-align: center;
  color: ${(props) => props.theme.lightText};
  font-family: "Roboto Mono", monospace;
  font-size: 0.85rem;
  border-top: 1px solid ${(props) => props.theme.border};
  background-color: ${(props) => props.theme.body};
`;

const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FooterLink = styled.a`
  color: ${(props) => props.theme.text};
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
  text-decoration: none;

  &::after {
    content: "";
    position: absolute;
    width: 0;
    height: 1px;
    bottom: -2px;
    left: 0;
    background-color: ${(props) => props.theme.text};
    transition: width 0.2s ease;
  }

  &:hover {
    color: ${(props) => props.theme.text};
    &::after {
      width: 100%;
    }
  }
`;

const Copyright = styled.div`
  letter-spacing: 0.05em;
  opacity: 0.8;
`;

const Footer = () => {
  return (
    <StyledFooter>
      <FooterContainer>
        <div>
          Design & Developed by{" "}
          <FooterLink
            href="https://github.com/Aniket0723"
            target="_blank"
            rel="noreferrer"
          >
            ANIKET0723
          </FooterLink>
        </div>
        <Copyright>© 2026. All rights reserved.</Copyright>
      </FooterContainer>
    </StyledFooter>
  );
};

export default Footer;
