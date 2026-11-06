import React from "react";
const person = {
  name: "Joyeeta Sardar",
  role: "BCA Student & Aspiring Developer",
  email: "joyeetasardar111@gmail.com",
  phone: "0000000025"
};
function Header(){return <header><h1>{person.name}</h1><p>{person.role}</p><nav><a href="#about">About</a><a href="#education">Education</a><a href="#skills">Skills</a><a href="#contact">Contact</a></nav></header>}
function About(){return <section id="about" className="card"><h2>About Me</h2><p>I am a student who enjoys building useful, accessible and responsive web applications. I am learning React and modern JavaScript.</p></section>}
function Education(){return <section id="education" className="card"><h2>Education</h2><p>
  <b>Bachelor of Computer Applications</b>
  — Techno India University (2027)
</p></section>}
function Skills(){return <section id="skills" className="card"><h2>Skills</h2><div className="row">{["HTML","CSS","JavaScript","React","SQL","Git"].map(s=><span className="pill" key={s}>{s}</span>)}</div></section>}
function Projects(){return <section className="card"><h2>Projects</h2><div className="grid"><article><h3>eLibrary</h3><p>A searchable digital library interface.</p></article><article><h3>Portfolio</h3><p>A responsive personal website built with React.</p></article></div></section>}
function Contact(){return <section id="contact" className="card"><h2>Contact</h2><p>Email: <a href={`mailto:${person.email}`}>{person.email}</a></p><p>Phone: {person.phone}</p></section>}
function Footer(){return <footer>© {new Date().getFullYear()} {person.name}. Built with React.</footer>}
export default function App(){return <><Header/><main className="container"><About/><Education/><Skills/><Projects/><Contact/></main><Footer/></>}
