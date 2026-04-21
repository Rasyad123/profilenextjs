import Image from "next/image";

const links = [

  {
    href: "https://wa.me/6285740751152",
    label: "WhatsApp",
    handle: "+62 857-4075-1152",
    description: "Chat langsung untuk pertanyaan, kerja sama, atau kontak cepat.",
    icon: <WhatsAppIcon />
  },
  {
    href: "https://instagram.com/rasyad_fajar",
    label: "Instagram",
    handle: "@rasyad_fajar",
    description: "Update visual, aktivitas, dan konten terbaru.",
    icon: <InstagramIcon />
  },
 
  {
    href: "https://t.me/RyanNoMercy",
    label: "Telegram",
    handle: "@RyanNoMercy",
    description: "Kontak langsung untuk pesan singkat dan cepat.",
    icon: <TelegramIcon />
  }
];

export default function HomePage() {
  return (
    <main className="hero-shell">
      <div className="bg-orb orb-one" aria-hidden="true" />
      <div className="bg-orb orb-two" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />

      <section className="hero-panel">
        <div className="hero-copy">
          <span className="hero-badge">Official Profile</span>
          <h1>Simple profile, looks clean.</h1>
          <p className="hero-description">
            Halaman singkat untuk menghubungi saya lewat channel utama dengan
            tampilan yang rapi, modern, dan nyaman dibuka di berbagai device.
          </p>

          <div className="hero-pills">
            <span className="hero-pill">Professional look</span>
            <span className="hero-pill">Fast contact access</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="avatar-ring avatar-ring-outer" aria-hidden="true" />
          <div className="avatar-ring avatar-ring-inner" aria-hidden="true" />

          <div className="avatar-card">
            <Image
              src="/assets/skipper-avatar.png"
              alt="Profile avatar"
              width={220}
              height={220}
              priority
            />

            <div className="avatar-meta">
              <span className="avatar-label">@rasyad_fajar</span>
              <span className="avatar-status">Open for contact</span>
            </div>
          </div>
        </div>

        <div className="social-list">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="social-card"
              target="_blank"
              rel="noreferrer"
            >
              <span className="social-icon">{link.icon}</span>
              <span className="social-copy">
                <span className="social-title">{link.label}</span>
                <span className="social-handle">{link.handle}</span>
                <span className="social-description">{link.description}</span>
              </span>
              <span className="social-arrow" aria-hidden="true">
                <ArrowUpRightIcon />
              </span>
            </a>
          ))}
        </div>

        <p className="footer-note">Designed to feel modern, clean, and easy to trust.</p>
      </section>
    </main>
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
