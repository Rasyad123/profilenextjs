import Image from "next/image";

const links = [
  {
    href: "https://instagram.com/rasyad_fajar",
    label: "See my instagram Profile",
    icon: <InstagramIcon />
  },
  {
    href: "https://spotify.link/J28GVk6ZKDb",
    label: "My Playlist Spotify",
    icon: <SpotifyIcon />
  },
  {
    href: "https://t.me/RyanNoMercy",
    label: "This My Telegram Account",
    icon: <TelegramIcon />
  },
  {
    href: "https://discord.gg/73M98NeWGn",
    label: "This My Discord Server",
    icon: <DiscordIcon />
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

function SpotifyIcon() {
  return (
    <IconBase>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M8 11.973c2.5 -1.473 5.5 -.973 7.5 .527" />
      <path d="M9 15c1.5 -1 4 -1 5 .5" />
      <path d="M7 9c2 -1 6 -2 10 .5" />
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

function DiscordIcon() {
  return (
    <IconBase>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M8 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
      <path d="M14 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
      <path d="M15.5 17c0 1 1.5 3 2 3c1.5 0 2.833 -1.667 3.5 -3c.667 -1.667 .5 -5.833 -1.5 -11.5c-1.457 -1.015 -3 -1.34 -4.5 -1.5l-.972 1.923a11.913 11.913 0 0 0 -4.053 0l-.975 -1.923c-1.5 .16 -3.043 .485 -4.5 1.5c-2 5.667 -2.167 9.833 -1.5 11.5c.667 1.333 2 3 3.5 3c.5 0 2 -2 2 -3" />
      <path d="M7 16.5c3.5 1 6.5 1 10 0" />
    </IconBase>
  );
}
