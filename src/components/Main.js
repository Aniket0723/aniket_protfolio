import React, { Suspense } from "react";
const LandingPage = React.lazy(() => import(".//LandingPage"));
const Projects = React.lazy(() => import("./Projects/Projects"));
const MoreProjects = React.lazy(() => import("./Projects/MoreProjects"));
const Contact = React.lazy(() => import("./Contact"));
const AboutMe = React.lazy(() => import("./AboutMe"));

const Main = ({ theme, isOpen }) => {
  return (
    <div
      style={{
        boxShadow: "none",
        filter: isOpen ? "blur(1px) brightness(0.6)" : "none",
        transition: "background-color 0.5s linear, transform 0.15s linear",
        transform: isOpen ? "scale(1.005)" : "scale(1)",
      }}
    >
      <Suspense fallback={<div> </div>}>
        <LandingPage theme={theme} />
        <AboutMe theme={theme} />
        <Projects theme={theme} />
        <MoreProjects theme={theme} />
        <Contact />
      </Suspense>
    </div>
  );
};

export default Main;
