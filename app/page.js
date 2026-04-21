import Image from "next/image";

const links = [
  {
    href: "https://instagram.com/rasyad_fajar",
    label: "See my instagram Profile",
    icon: <InstagramIcon />
  },
  {
    href: "https://t.me/RyanNoMercy",
    label: "This My Telegram Account",
    icon: <TelegramIcon />
  }
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="container">
        <div className="img-container">
          <Image
            src="/assets/skipper-avatar.png"
            alt="Profile avatar"
            width={150}
            height={150}
            priority
          />
        </div>

        <div className="title-container">
          <h1>@ryan_xs</h1>
          <p>BIBD is</p>
        </div>

        <div className="links-list">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="link-item"
              target="_blank"
              rel="noreferrer"
            >
              <span className="icon">{link.icon}</span>
              <span className="link-label">{link.label}</span>
              <span className="link-spacer" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
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
