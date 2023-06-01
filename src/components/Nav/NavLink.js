import React, { useContext } from 'react'
import { NavContext } from '../../context/NavContext'
import styled from 'styled-components'

const Span = styled.span`
  font-size: 25px;
  transition: border 0.2s ease;
  transition-delay: 0.25s;
  margin: 1em;
  border-radius:5px;
  padding-bottom: 0.3em;
  padding: 10px;
  width:100%;
  border: ${(props) => (props.border ? '1px solid grey' : 'none')};
  cursor: pointer;
  &:hover {
    cursor: pointer;
    border: ${(props) => props.theme.navbar.border};
    
  }
  @media (max-width: 768px) {
    &:hover {
      border: 1px solid grey;
    }
  }
`
const NavLink = ({ navLinkId, scrollToId }) => {
  const { activeNavLinkId, setActiveNavLinkId } = useContext(NavContext)

  const handleClick = () => {
    setActiveNavLinkId(navLinkId)
    document.getElementById(scrollToId).scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Span
      id={navLinkId}
      onClick={handleClick}
      borderBottom={activeNavLinkId === navLinkId ? true : ''}
      role='link'
      title={navLinkId}
      tabIndex='0'
    >
      {navLinkId}
    </Span>
  )
}

export default NavLink
