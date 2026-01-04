import React, { useRef } from "react";
import styled from "styled-components/macro";
import emailjs from "@emailjs/browser";
import { Fade } from "react-awesome-reveal";
import { FaPaperPlane } from "react-icons/fa";

const StyledContactSection = styled.section`
  color: ${(props) => props.theme.text};
  padding: 2rem 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 2rem 1.25rem 3rem;
  }
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 4rem;
  align-items: flex-start;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const ContactContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h2`
  font-family: "Syne", sans-serif;
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: 768px) {
    font-size: 1.8rem;
    text-align: center;
    margin-bottom: 2rem;
  }
`;

const ContactInfo = styled.div`
  text-align: left;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.8;
  color: ${(props) => props.theme.secondaryText};
  max-width: 500px;

  @media (max-width: 768px) {
    text-align: center;
    margin: 0 auto 2rem;
    font-size: 1rem;
  }

  a {
    color: ${(props) => props.theme.text};
    text-decoration: underline;
    text-underline-offset: 4px;
    font-weight: 600;

    &:hover {
      color: ${(props) => props.theme.secondaryText};
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background: ${(props) => props.theme.cardBg};
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.border};
  max-width: 450px;
  width: 100%;

  @media (max-width: 768px) {
    margin: 0 auto;
    padding: 1.2rem;
    gap: 1rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${(props) => props.theme.lightText};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  input,
  textarea {
    background: transparent;
    border: 1px solid ${(props) => props.theme.border};
    border-radius: 8px;
    padding: 0.6rem 0.8rem;
    color: ${(props) => props.theme.text};
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${(props) => props.theme.secondaryText};
      box-shadow: 0 0 0 2px ${(props) => props.theme.border};
    }
  }
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${(props) => props.theme.buttonColor};
  color: ${(props) => props.theme.buttonText};
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  svg {
    font-size: 1rem;
  }
`;

const Contact = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(
        "service_736srvf",
        "template_1utkpcb",
        form.current,
        "3BL03hzndfeYjejXx"
      )
      .then(
        (result) => {
          alert("Message sent successfully!");
          e.target.reset();
        },
        (error) => {
          console.log(error.text);
          alert("Failed to send message. Please try again.");
        }
      );
  };

  return (
    <StyledContactSection id="contactContainer">
      <Fade direction="up" triggerOnce>
        <ContactGrid>
          <ContactContent>
            <SectionTitle>Get In Touch</SectionTitle>
            <ContactInfo>
              Have a project in mind or just want to chat? Feel free to reach
              out. I&apos;m currently available for new opportunities.
              <br />
              <br />
              Email me at{" "}
              <a href="mailto:anunagrale77@gmail.com">
                anunagrale77@gmail.com
              </a>{" "}
              or find me on{" "}
              <a
                href="https://www.linkedin.com/in/aniket-nagrale-80939a179/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              .
            </ContactInfo>
          </ContactContent>

          <Form ref={form} onSubmit={sendEmail}>
            <FormGroup>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="user_name"
                placeholder="Your Name"
                required
              />
            </FormGroup>

            <FormGroup>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="user_email"
                placeholder="Your Email"
                required
              />
            </FormGroup>

            <FormGroup>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="How can I help you?"
                required
              />
            </FormGroup>

            <SubmitButton type="submit">
              Send Message <FaPaperPlane />
            </SubmitButton>
          </Form>
        </ContactGrid>
      </Fade>
    </StyledContactSection>
  );
};

export default Contact;
