import React, { useContext } from "react";
import { NavContext } from "../../context/NavContext";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";

const NavItem = styled.span`
  font-size: 1rem;
  font-weight: 500;
  margin: 0 1.5rem;
  cursor: pointer;
  color: ${(props) =>
    props.active ? props.theme.text : props.theme.secondaryText};
  transition: color 0.2s ease;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    width: ${(props) => (props.active ? "100%" : "0")};
    height: 1.5px;
    bottom: -4px;
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

  @media (max-width: 768px) {
    margin: 1rem 0;
    font-size: 1.25rem;
  }
`;

const NavLink = ({ navLinkId, scrollToId, path }) => {
  const { activeNavLinkId, setActiveNavLinkId } = useContext(NavContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    setActiveNavLinkId(navLinkId);

    // Path-based navigation (e.g. /learn)
    if (path) {
      navigate(path);
      return;
    }

    const scrollToSection = () => {
      const element = document.getElementById(scrollToId);
      if (element) {
        const navbarHeight = document.querySelector("nav")?.offsetHeight || 65;
        const top =
          element.getBoundingClientRect().top +
          window.scrollY -
          navbarHeight -
          24;
        window.scrollTo({ top, behavior: "smooth" });
      }
    };

    // If on a non-home page, navigate back to home first then scroll
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(scrollToSection, 150);
    } else {
      scrollToSection();
    }
  };

  const isActive =
    activeNavLinkId === navLinkId ||
    (path && location.pathname.startsWith(path));

  return (
    <NavItem
      id={navLinkId}
      onClick={handleClick}
      active={isActive}
      role="link"
      title={navLinkId}
      tabIndex="0"
    >
      {navLinkId}
    </NavItem>
  );
};

export default NavLink;
