"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { href: "#home", label: "Home", id: "home" },
  { href: "#about", label: "About", id: "about" },
  { href: "#music", label: "Music", id: "music" },
  { href: "#contact", label: "Contact", id: "contact" }
];

const stats = [
  { value: "4", label: "Clean dashboard sections" },
  { value: "Smooth", label: "Scroll and hover animation" },
  { value: "Mobile", label: "Responsive layout ready" }
];

const aboutHighlights = [
  {
    eyebrow: "01",
    title: "Clean identity",
    description:
      "First impression dibuat lebih tegas: nama, karakter visual, dan arah halaman langsung kebaca."
  },
  {
    eyebrow: "02",
    title: "Story with structure",
    description:
      "About tidak cuma jadi teks panjang, tapi disusun seperti cerita singkat yang enak discan."
  },
  {
    eyebrow: "03",
    title: "Responsive flow",
    description:
      "Jarak, ukuran, dan susunan section dibuat lebih lega supaya tidak terasa numpuk."
  }
];

const aboutStats = [
  { value: "Dark", label: "visual mood" },
  { value: "Neat", label: "content flow" },
  { value: "Soft", label: "motion style" }
];

const aboutTags = ["Personal profile", "Responsive UI", "Clean layout", "Fast contact"];

const playlists = [
  {
    title: "Focus Mode",
    meta: "Lo-fi / ambient",
    description: "Vibe tenang buat fokus, ngerjain tugas, atau jaga mood tetap stabil."
  },
  {
    title: "Clean Energy",
    meta: "Pop / upbeat",
    description: "Lagu yang ringan, bright, dan enak diputar saat butuh energi."
  },
  {
    title: "Deep Mode",
    meta: "Instrumental / cinematic",
    description: "Pilihan yang lebih dalam buat momen fokus panjang dan serius."
  }
];

const contactLinks = [
  {
    href: "https://wa.me/6285740751152",
    label: "WhatsApp",
    handle: "+62 857-4075-1152",
    description: "Paling cepat untuk chat langsung, kerja sama, atau keperluan penting.",
    icon: <WhatsAppIcon />
  },
  {
    href: "https://instagram.com/rasyad_fajar",
    label: "Instagram",
    handle: "@rasyad_fajar",
    description: "Tempat untuk lihat update visual, aktivitas, dan vibe sehari-hari.",
    icon: <InstagramIcon />
  },
  {
    href: "https://t.me/RyanNoMercy",
    label: "Telegram",
    handle: "@RyanNoMercy",
    description: "Alternatif komunikasi singkat yang tetap langsung dan praktis.",
    icon: <TelegramIcon />
  }
];

const blurPlaceholder =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMjQnIGhlaWdodD0nMjQnIHZpZXdCb3g9JzAgMCAyNCAyNCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9J2cnIHgxPScwJyB5MT0nMCcgeDI9JzEnIHkyPScxJz48c3RvcCBzdG9wLWNvbG9yPScjMTMxNTJiJy8+PHN0b3Agb2Zmc2V0PScwLjUnIHN0b3AtY29sb3I9JyM0YzFhMmYnLz48c3RvcCBvZmZzZXQ9JzEnIHN0b3AtY29sb3I9JyMyNTI4NTUnLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0nMjQnIGhlaWdodD0nMjQnIGZpbGw9J3VybCgjZyknLz48L3N2Zz4=";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("home");
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRef = useRef(null);
  const linkRefs = useRef({});

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    let frame = 0;

    const updateActiveSection = () => {
      const scrollBottom = window.scrollY + window.innerHeight;
      const pageBottom = document.documentElement.scrollHeight - 8;

      if (scrollBottom >= pageBottom) {
        setActiveSection("contact");
        return;
      }

      const marker = 150;
      let current = sections[0]?.id ?? "home";

      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= marker) {
          current = section.id;
        }
      });

      setActiveSection(current);
    };

    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    const updateIndicator = () => {
      const navElement = navRef.current;
      const activeLink = linkRefs.current[activeSection];

      if (!navElement || !activeLink) {
        return;
      }

      const navRect = navElement.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();

      setIndicatorStyle({
        width: `${linkRect.width - 20}px`,
        transform: `translateX(${linkRect.left - navRect.left + 10}px)`
      });
    };

    const frame = requestAnimationFrame(updateIndicator);
    const navElement = navRef.current;
    const resizeObserver =
      typeof ResizeObserver !== "undefined" && navElement
        ? new ResizeObserver(updateIndicator)
        : null;

    updateIndicator();
    document.fonts?.ready?.then(updateIndicator);
    resizeObserver?.observe(navElement);
    window.addEventListener("resize", updateIndicator);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeSection]);

  useEffect(() => {
    const targets = document.querySelectorAll(".reveal-up");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.16
      }
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="dashboard-shell">
      <div className="bg-orb orb-one" aria-hidden="true" />
      <div className="bg-orb orb-two" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />

      <header className="site-header">
        <a href="#home" className="brand">
          <span className="brand-mark">RF</span>
          <span className="brand-copy">
            <strong>Rasyad Fajar</strong>
            <span>Personal dashboard</span>
          </span>
        </a>

        <nav ref={navRef} className="site-nav" aria-label="Primary">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              ref={(element) => {
                linkRefs.current[item.id] = element;
              }}
              className={`nav-link ${activeSection === item.id ? "is-active" : ""}`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.label}
            </a>
          ))}
          <span className="nav-indicator" aria-hidden="true" style={indicatorStyle} />
        </nav>
      </header>

      <main className="dashboard-main">
        <section id="home" className="panel hero-panel reveal-up is-visible">
          <div className="hero-copy">
            <span className="section-kicker">Home</span>
            <h1>Dashboard profile yang rapi, smooth, dan gampang dibaca.</h1>
            <p className="hero-description">
              Semua bagian dibuat jelas: Home untuk kesan pertama, About untuk
              cerita singkat, Music untuk vibe, dan Contact khusus buat jalur
              komunikasi.
            </p>

            <div className="stat-grid">
              {stats.map((item) => (
                <div key={item.label} className="stat-card">
                  <span className="stat-value">{item.value}</span>
                  <span className="stat-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="avatar-aura" aria-hidden="true" />
            <div className="avatar-orbit orbit-one" aria-hidden="true" />
            <div className="avatar-orbit orbit-two" aria-hidden="true" />

            <div className="profile-card">
              <div className="avatar-shell">
                <BlurImage
                  src="/assets/home-photo.jpg"
                  alt="Rasyad Fajar profile photo"
                  width={240}
                  height={240}
                  priority
                />
              </div>

              <div className="profile-copy">
                <span className="profile-name">@rasyad_fajar</span>
                <span className="profile-status">Clean personal dashboard</span>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="panel about-panel about-showcase reveal-up">
          <div className="about-media">
            <BlurImage
              src="/assets/profile-photo.jpg"
              alt="Rasyad Fajar outdoor profile photo"
              width={960}
              height={540}
            />
            <div className="about-media-caption">
              <span>Rasyad Fajar</span>
              <strong>Personal dashboard</strong>
            </div>
          </div>

          <div className="about-story">
            <span className="section-kicker">About</span>
            <h2>Kenalan singkat yang dibuat lebih hidup.</h2>
            <p className="section-copy">
              Halo, saya Rasyad Fajar. Halaman ini jadi tempat buat ngenalin diri
              dengan tampilan yang lebih clean, rapi, dan langsung mengarah ke hal
              penting: siapa saya, vibe yang ingin ditampilkan, dan kesan yang
              ingin ditinggalkan.
            </p>

            <div className="about-tags" aria-label="Profile qualities">
              {aboutTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className="about-stat-row">
              {aboutStats.map((item) => (
                <div key={item.label} className="about-stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="about-grid">
            {aboutHighlights.map((item) => (
              <article key={item.title} className="about-card">
                <span className="about-index">{item.eyebrow}</span>
                <div className="about-copy">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="music" className="panel music-panel reveal-up">
          <div className="section-head">
            <span className="section-kicker">Music</span>
            <h2>Playlist mood and listening vibe.</h2>
            <p className="section-copy">
              Bagian ini nunjukin taste musik dan mood yang biasa saya putar
              saat fokus, santai, atau butuh energi lebih.
            </p>
          </div>

          <div className="playlist-grid">
            {playlists.map((item) => (
              <article key={item.title} className="playlist-card">
                <div className="playlist-head">
                  <h3>{item.title}</h3>
                  <span className="playlist-meta">
                    <span className="music-meter" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    {item.meta}
                  </span>
                </div>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="panel contact-panel reveal-up">
          <div className="section-head section-head-wide">
            <div>
              <span className="section-kicker">Contact</span>
              <h2>Pilih kontak yang paling nyaman.</h2>
            </div>

            <p className="section-copy">
              Semua channel penting ada di sini. Tinggal pilih jalur yang paling
              nyaman buat Anda.
            </p>
          </div>

          <div className="contact-grid">
            {contactLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="contact-card"
                target="_blank"
                rel="noreferrer"
              >
                <span className="contact-icon">{link.icon}</span>
                <span className="contact-copy">
                  <span className="contact-title">{link.label}</span>
                  <span className="contact-handle">{link.handle}</span>
                  <span className="contact-description">{link.description}</span>
                </span>
                <span className="contact-arrow" aria-hidden="true">
                  <ArrowUpRightIcon />
                </span>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function BlurImage({ className = "", onLoad, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Image
      {...props}
      className={`blur-image ${isLoaded ? "is-loaded" : ""} ${className}`.trim()}
      placeholder="blur"
      blurDataURL={blurPlaceholder}
      onLoad={(event) => {
        setIsLoaded(true);
        onLoad?.(event);
      }}
    />
  );
}

function IconBase({ children }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <IconBase>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M17 7l-10 10" />
      <path d="M8 7h9v9" />
    </IconBase>
  );
}

function InstagramIcon() {
  return (
    <IconBase>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
      <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M16.5 7.5l0 .01" />
    </IconBase>
  );
}

function TelegramIcon() {
  return (
    <IconBase>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />
    </IconBase>
  );
}

function WhatsAppIcon() {
  return (
    <IconBase>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
      <path d="M9 10a.5 .5 0 0 0 0 1a5 5 0 0 0 5 5a.5 .5 0 0 0 1 0v-2a.5 .5 0 0 0 -.5 -.5h-1a.5 .5 0 0 0 -.5 .5v.3a.5 .5 0 0 1 -.8 .4l-2.4 -2.4a.5 .5 0 0 1 .4 -.8h.3a.5 .5 0 0 0 .5 -.5v-1a.5 .5 0 0 0 -.5 -.5h-2z" />
    </IconBase>
  );
}
