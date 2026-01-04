import React, { useContext } from "react";
import { NavContext } from "../../context/NavContext";
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

const NavLink = ({ navLinkId, scrollToId }) => {
  const { activeNavLinkId, setActiveNavLinkId } = useContext(NavContext);

  const handleClick = () => {
    setActiveNavLinkId(navLinkId);
    document.getElementById(scrollToId).scrollIntoView({ behavior: "smooth" });
  };

  return (
    <NavItem
      id={navLinkId}
      onClick={handleClick}
      active={activeNavLinkId === navLinkId}
      role="link"
      title={navLinkId}
      tabIndex="0"
    >
      {navLinkId}
    </NavItem>
  );
};

export default NavLink;
