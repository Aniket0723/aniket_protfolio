import Main from "./components/Main";
import { useState } from "react";

function App() {
  const [theme, setTheme] = useState("darkTheme");
  const [isOpen, setIsOpen] = useState(false);

  return <Main theme={theme} isOpen={isOpen} />;
}

export default App;
