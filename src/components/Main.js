import React, { Suspense } from "react";

const LandingPage = React.lazy(() => import("./LandingPage"));
const VisitorCounter = React.lazy(() => import("./VisitorCounter"));
const AboutMe = React.lazy(() => import("./AboutMe"));
const Projects = React.lazy(() => import("./Projects/Projects"));
const Contact = React.lazy(() => import("./Contact"));

const PageLoader = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  />
);

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
      <Suspense fallback={<PageLoader />}>
        <LandingPage theme={theme} />
        <VisitorCounter />
        <AboutMe theme={theme} />
        <Projects theme={theme} />
        <Contact />
      </Suspense>
    </div>
  );
};

export default Main;
