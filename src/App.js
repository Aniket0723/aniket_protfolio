import { ThemeProvider } from "styled-components/macro";
import GlobalStyles from "./globalStyles";
import { lightTheme, darkTheme } from "./components/Themes";
import Main from "./components/Main";
import Navbar from "./components/Nav/Navbar";
import NavProvider from "./context/NavContext";
import Footer from "./components/Footer";
import { useState } from "react";

function App() {
  const [theme, setTheme] = useState("darkTheme");
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ThemeProvider theme={theme === "lightTheme" ? lightTheme : darkTheme}>
        <GlobalStyles />
        <NavProvider>
          <Navbar
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            theme={theme}
            setTheme={setTheme}
          />
          <Main theme={theme} isOpen={isOpen} />
          <Footer />
        </NavProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
