export const introSteps = [
  { label: "Frontend", icon: "code" },
  { label: "Backend", icon: "data" },
  { label: "System", icon: "cmd" },
  { label: "UI/UX", icon: "palette" }
];

export const profileImages = {
  homePhoto: {
    src: "/assets/home-photo.jpg",
    alt: "Rasyad Fajar profile photo",
    naturalWidth: 4000,
    naturalHeight: 3000,
    usage: "Hero profile card"
  },
  profilePhoto: {
    src: "/assets/profile-photo.jpg",
    alt: "Rasyad Fajar outdoor profile photo",
    naturalWidth: 815,
    naturalHeight: 1280,
    usage: "About section portrait"
  },
  skipperAvatar: {
    src: "/assets/skipper-avatar.png",
    alt: "Skipper avatar legacy asset",
    naturalWidth: 826,
    naturalHeight: 1325,
    usage: "Stored legacy image asset"
  },
  skipperBackground: {
    src: "/assets/skipper-background.png",
    alt: "Skipper background legacy asset",
    naturalWidth: 960,
    naturalHeight: 572,
    usage: "Stored legacy background asset"
  }
};

export const projectCommands = [
  {
    label: "Run development server",
    command: "npm.cmd run dev"
  },
  {
    label: "Run tests",
    command: "npm.cmd test"
  },
  {
    label: "Build static export",
    command: "npm.cmd run build"
  },
  {
    label: "Upload build output to cPanel",
    command: "scp -r .\\out\\* rasyadf1@tarsius.kencang.com:/home/rasyadf1/public_html/"
  }
];
