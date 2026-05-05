import React, { useState, useMemo } from "react";

export const NavContext = React.createContext();

const NavProvider = ({ children }) => {
  const [activeNavLinkId, setActiveNavLinkId] = useState("");

  const providerValue = useMemo(
    () => ({ activeNavLinkId, setActiveNavLinkId }),
    [activeNavLinkId],
  );

  return (
    <NavContext.Provider value={providerValue}>{children}</NavContext.Provider>
  );
};

export default NavProvider;
