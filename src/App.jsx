import NeuralBackground from "./components/NeuralBackground.jsx";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import Work from "./components/Work.jsx";
import Machine from "./components/Machine.jsx";
import Stack from "./components/Stack.jsx";
import About from "./components/About.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <NeuralBackground />
      <Nav />
      <main id="main">
        <Hero />
        <Work />
        <Machine />
        <Stack />
        <About />
      </main>
      <Footer />
    </>
  );
}
