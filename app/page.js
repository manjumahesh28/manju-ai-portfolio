import ChatWidget from '@/components/ChatWidget';
import Reveal from '@/components/Reveal';

const toolkit = [
  'React.js', 'Next.js', 'JavaScript', 'Python', 'Django', 'Django REST Framework',
  'Flask', 'REST APIs', 'JWT auth', 'MySQL', 'SQL', 'Deep learning', 'DenseNet / CNNs',
  'RAG & embeddings', 'Git & GitHub', 'Vercel', 'Google Cloud', 'Postman',
];

const projects = [
  {
    num: '01',
    category: 'Client project · Ddesigny Architectural Consultancy',
    name: 'Account Management System',
    stack: ['React.js', 'Django', 'REST APIs', 'MySQL'],
    summary:
      'An in-house web app that replaced manual tracking of client accounts, invoices and payments. Staff manage clients, invoices, payments and expenses in one place, with a dashboard of balances and pending payments.',
    points: [
      'Designed the database structure and REST APIs',
      'Secure login with role-based access to records',
      'Monthly summaries exported to PDF and Excel',
    ],
  },
  {
    num: '02',
    category: 'Deep learning project',
    name: 'Skin Disease Prediction',
    stack: ['Python', 'DenseNet', 'Flask'],
    summary:
      'Classifies skin conditions from images. Images are resized and normalised, a DenseNet-based model predicts the condition, and a Flask web app lets a user upload a photo and see the result.',
    points: [
      'Preprocessed a medical image dataset for training',
      'DenseNet reuses features across layers for image classification',
      'A learning project, not a medical diagnosis',
    ],
  },
];

const alsoBuilt = [
  { name: 'Full-Stack E-Commerce Platform', text: 'React.js, Django, REST APIs, MySQL' },
  { name: 'Bone Fracture Detection', text: 'CNN on X-ray images, about 90% accuracy' },
  { name: 'Earthquake Prediction', text: 'Machine learning on historical seismic data' },
  { name: 'Talk to Manju (this site)', text: 'Next.js RAG assistant with citations' },
];

const experience = [
  {
    role: 'Web Developer',
    org: 'Ddesigny Architectural Consultancy',
    place: 'Abu Dhabi, UAE',
    dates: 'Aug 2026 – Sept 2026',
    text: 'Built an in-house Account Management System with React.js, Django and MySQL, including role-based access, testing and user onboarding.',
  },
  {
    role: 'Web Development Intern',
    org: '8 Queens Technologies',
    place: 'Chennai, India',
    dates: 'Aug 2025 – Jan 2026',
    text: 'Built responsive web applications with ReactJS frontends and Django backends, and designed RESTful APIs connecting them to relational databases.',
  },
];

export default function Home() {
  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <a href="#top" className="brand">MANJU<span>.</span></a>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#work">Work</a>
            <a href="#experience">Experience</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      <main id="top">
        {/* ---------- Hero ---------- */}
        <header className="hero">
          <div className="hero-bg-word" aria-hidden="true">BUILD</div>
          <div className="container hero-grid">
            <div className="hero-text">
              <p className="label"><span className="dot" />Manju Mahesh · Abu Dhabi, UAE</p>
              <h1 className="display">
                Full-stack
                <br />
                <span className="outline">Developer</span><span className="accent">.</span>
              </h1>
              <p className="lede">
                I build web applications end to end, with React on the frontend and Django on the
                backend, and I&apos;ve applied deep learning to medical images.
              </p>
              <div className="hero-actions">
                <a href="#work" className="btn btn-primary">View my work →</a>
                <a href="#contact" className="btn btn-ghost"><span className="dot" />Contact me</a>
                <a href="https://github.com/manjumahesh28/manju-ai-portfolio" target="_blank" rel="noreferrer" className="btn btn-ghost">View source code</a>              
              </div>
              <p className="hero-hint">
                Questions? Use <strong>Talk to Manju</strong> at the bottom right. It answers only
                from my CV and project notes.
              </p>
            </div>

            <div className="badge-wrap" aria-hidden="true">
              <div className="badge">
                <div className="badge-clip" />
                <div className="badge-inner">
                  <div className="monogram">MM</div>
                  <p className="badge-name">Manju Mahesh</p>
                  <p className="badge-role">Full-stack Developer</p>
                  <div className="badge-meta">
                    <span>React · Django · AI</span>
                    <span>Abu Dhabi</span>
                  </div>
                  <p className="badge-status"><span className="dot" />Open to work</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ---------- About ---------- */}
        <section className="section" id="about">
          <div className="container about-grid">
            <Reveal>
              <p className="label">About</p>
              <h2 className="display h2">
                Building with <span className="outline">purpose</span><span className="accent">.</span>
              </h2>
              <p className="body">
                I&apos;m a Computer Science and Engineering graduate (Anna University, 2025) and a
                certified Python Full Stack Developer. I enjoy turning manual, messy processes into
                clean web apps, like the account management system I built for an architectural
                consultancy in Abu Dhabi.
              </p>
              <p className="body">
                I&apos;m now focused on applied AI: this site&apos;s assistant is a retrieval-augmented
                system I built to answer only from my own documents, with citations and honest
                &quot;I don&apos;t know&quot; answers.
              </p>
              <div className="stats">
                <div><strong>6</strong><span>Projects built</span></div>
                <div><strong>2</strong><span>Developer roles</span></div>
                <div><strong>2025</strong><span>CS graduate</span></div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="glass">
                <p className="label">My toolkit</p>
                <ul className="chips">
                  {toolkit.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- Work ---------- */}
        <section className="section" id="work">
          <div className="container">
            <Reveal>
              <p className="label">Selected work</p>
              <h2 className="display h2">
                Recent <span className="outline">projects</span><span className="accent">.</span>
              </h2>
            </Reveal>

            <div className="projects">
              {projects.map((p, i) => (
                <Reveal key={p.name} delay={i * 120}>
                  <article className="project">
                    <span className="project-num">{p.num}</span>
                    <p className="project-cat">{p.category}</p>
                    <h3>{p.name}</h3>
                    <p className="body">{p.summary}</p>
                    <ul className="points">
                      {p.points.map((pt) => <li key={pt}>{pt}</li>)}
                    </ul>
                    <ul className="tags">
                      {p.stack.map((t) => <li key={t}>{t}</li>)}
                    </ul>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div className="also">
                <p className="label">Also built</p>
                <ul>
                  {alsoBuilt.map((a) => (
                    <li key={a.name}><strong>{a.name}</strong><span>{a.text}</span></li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- Experience ---------- */}
        <section className="section" id="experience">
          <div className="container">
            <Reveal>
              <p className="label">Experience</p>
              <h2 className="display h2">
                Where I&apos;ve <span className="outline">worked</span><span className="accent">.</span>
              </h2>
            </Reveal>
            <ol className="timeline">
              {experience.map((e, i) => (
                <li key={e.org}>
                  <Reveal delay={i * 120}>
                    <div className="timeline-head">
                      <div>
                        <h3>{e.role}</h3>
                        <p className="timeline-org">{e.org} · {e.place}</p>
                      </div>
                      <span className="timeline-date">{e.dates}</span>
                    </div>
                    <p className="body">{e.text}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
            <div className="edu-grid">
              <Reveal>
                <div className="edu-card">
                  <p className="label">Education</p>
                  <h3>BE, Computer Science and Engineering</h3>
                  <p>Anna University, India · 2021 – 2025</p>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div className="edu-card">
                  <p className="label">Certification</p>
                  <h3>Python Full Stack Developer</h3>
                  <p>Srishti Campus, Thiruvananthapuram · 2024</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- Contact / footer ---------- */}
        <footer className="footer" id="contact">
          <div className="footer-bg-word" aria-hidden="true">CONTACT</div>
          <div className="container">
            <div className="footer-top">
              <Reveal>
                <h2 className="display h2">
                  Let&apos;s work <span className="outline">together</span><span className="accent">.</span>
                </h2>
                <p className="body">
                  I&apos;m looking for full-stack and junior AI developer roles in the UAE.
                </p>
                <a href="mailto:manjumahesh2803@gmail.com" className="btn btn-white">
                  manjumahesh2803@gmail.com
                </a>
              </Reveal>
              <Reveal delay={150}>
                <div className="footer-links">
                  <div>
                    <p className="label">Menu</p>
                    <a href="#about">About</a>
                    <a href="#work">Work</a>
                    <a href="#experience">Experience</a>
                  </div>
                  <div>
                    <p className="label">Socials</p>
                    <a href="https://linkedin.com/in/manjumahesh2809" target="_blank" rel="noreferrer">LinkedIn</a>
                    <a href="https://github.com/manjumahesh28/manju-ai-portfolio" target="_blank" rel="noreferrer">This site&apos;s code</a>                    
                    <a href="https://github.com/manjumahesh28" target="_blank" rel="noreferrer">GitHub</a>
                  </div>
                </div>
              </Reveal>
            </div>
            <div className="footer-bottom">
              <p>© 2026 Manju Mahesh</p>
              <p>
                The assistant retrieves from my documents by embedding similarity and must cite them or
                say it doesn&apos;t know.
              </p>
            </div>
          </div>
        </footer>
      </main>

      <ChatWidget />
    </> 
    
  
  );
}