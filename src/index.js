import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "styled-components/macro";
import GlobalStyles from "./globalStyles";
import { lightTheme, darkTheme } from "./components/Themes";
import Main from "./components/Main";
import ProjectDetail from "./components/Projects/ProjectDetail";
import Navbar from "./components/Nav/Navbar";
import NavProvider from "./context/NavContext";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable browser scroll restoration
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const RootApp = () => {
  const [theme, setTheme] = useState("darkTheme");
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = theme === "lightTheme" ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyles />
      <BrowserRouter>
        <NavProvider>
          <ScrollToTop />
          <Navbar
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            theme={theme}
            setTheme={setTheme}
          />
          <Routes>
            <Route path="/" element={<Main theme={theme} isOpen={isOpen} />} />
            <Route
              path="/project/:id"
              element={<ProjectDetail theme={theme} />}
            />
          </Routes>
          <Footer />
        </NavProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>,
  document.getElementById("root"),
);

// Disable browser scroll restoration globally
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}
