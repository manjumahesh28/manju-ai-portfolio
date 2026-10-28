import ChatWidget from '@/components/ChatWidget';

const projects = [
  {
    name: 'Account Management System — Ddesigny',
    stack: ['React.js', 'Django', 'REST APIs', 'MySQL'],
    summary:
      'An in-house web app for Ddesigny Architectural Consultancy in Abu Dhabi that replaced manual tracking of client accounts, invoices and payments. Staff manage clients, invoices, payments and expenses in one place, with a dashboard of balances and pending payments.',
    points: [
      'Designed the database structure and the REST APIs',
      'Secure login with role-based access to records',
      'Monthly summaries exported to PDF and Excel',
    ],
  },
  {
    name: 'Skin Disease Prediction',
    stack: ['Python', 'DenseNet', 'Flask'],
    summary:
      'A deep-learning project that classifies skin conditions from images. Images are resized and normalised, a DenseNet-based model predicts the condition, and a Flask web app lets a user upload a photo and see the result.',
    points: [
      'Preprocessed a medical image dataset for training',
      'DenseNet reuses features across layers for image classification',
      'A learning project, not a medical diagnosis',
    ],
  },
];

const skills = ['Python', 'Django', 'Django REST Framework', 'React.js', 'Next.js', 'JavaScript', 'MySQL', 'Flask', 'Deep learning', 'RAG & embeddings'];

export default function Home() {
  return (
    <>
      <main className="page">
        <header className="hero">
          <p className="eyebrow">Abu Dhabi, UAE</p>
          <h1>Manju Mahesh</h1>
          <p className="role">Full-stack developer · React, Django & applied AI</p>
          <p className="lede">
            I build web applications end to end, with React on the frontend and Django on the
            backend, and I&apos;ve applied deep learning to medical images. BE in Computer Science
            and Engineering from Anna University, and a certified Python Full Stack Developer.
          </p>
          <p className="hint">
            Questions about me? Click <strong>Talk to Manju</strong>. It answers only from my CV
            and project notes, and tells you when it doesn&apos;t know.
          </p>
        </header>

        <section>
          <h2>What I work with</h2>
          <ul className="chips">
            {skills.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>

        <section>
          <h2>Projects</h2>
          <div className="projects">
            {projects.map((p) => (
              <article key={p.name} className="card">
                <h3>{p.name}</h3>
                <ul className="tags">
                  {p.stack.map((t) => <li key={t}>{t}</li>)}
                </ul>
                <p>{p.summary}</p>
                <ul className="points">
                  {p.points.map((pt) => <li key={pt}>{pt}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2>Experience</h2>
          <ul className="timeline">
            <li>
              <strong>Web Developer — Ddesigny Architectural Consultancy, Abu Dhabi</strong>
              <span>Aug 2026 – Sept 2026 · Built an in-house Account Management System.</span>
            </li>
            <li>
              <strong>Web Development Intern — 8 Queens Technologies, Chennai</strong>
              <span>Aug 2025 – Jan 2026 · ReactJS frontends, Django backends, REST APIs.</span>
            </li>
          </ul>
        </section>

        <section>
          <h2>Get in touch</h2>
          <ul className="links">
            <li><a href="mailto:manjumahesh2803@gmail.com">manjumahesh2803@gmail.com</a></li>
            <li><a href="https://linkedin.com/in/manjumahesh2809" target="_blank" rel="noreferrer">LinkedIn</a></li>
            <li><a href="https://github.com/manjumahesh28" target="_blank" rel="noreferrer">GitHub</a></li>
          </ul>
        </section>

        <footer className="footer">
          <p>
            How the assistant works: my documents are split into chunks by heading, embedded with
            Gemini, and searched by cosine similarity. Only the best matches are given to the
            model, which must cite them and say when the answer isn&apos;t there.
          </p>
        </footer>
      </main>
      <ChatWidget />
    </>
  );
}
