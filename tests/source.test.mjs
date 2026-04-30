import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const pageSource = readFileSync("app/page.js", "utf8");
const cssSource = readFileSync("app/globals.css", "utf8");
let profileDataSource = "";

try {
  profileDataSource = readFileSync("app/data/profile.js", "utf8");
} catch {
  profileDataSource = "";
}

test("hero copy uses the intended polished spelling", () => {
  assert.match(pageSource, /Dashboard Simple Profile, With Modern Clean UI\./);
  assert.doesNotMatch(pageSource, /Modren/);
});

test("spotify cards toggle the embedded player", () => {
  assert.match(pageSource, /const \[selectedTrack, setSelectedTrack\] = useState\(null\)/);
  assert.match(pageSource, /currentTrack\?\.spotifyId === item\.spotifyId \? null : item/);
  assert.match(pageSource, /spotify-player \$\{selectedTrack \? "is-visible" : ""\}/);
});

test("spotify playlist keeps the requested track ids", () => {
  [
    "3e1rs346dsDDwpqTRGlRZR",
    "2xlV2CuWgpPyE9e0GquKDN",
    "6mQLN3zRtAp6ovjusyYKrV",
    "7D4bglfWu6vp2XzFd3o8tW",
    "6Uwi2Qk3H7fM4b4W4ExrAp",
    "3qhlB30KknSejmIvZZLjOD"
  ].forEach((spotifyId) => {
    assert.match(pageSource, new RegExp(`spotifyId: "${spotifyId}"`));
  });
});

test("tablet breakpoint stays desktop-like while phones use the mobile layout", () => {
  assert.match(cssSource, /@media \(max-width: 699px\)/);
  assert.match(cssSource, /@media \(min-width: 700px\) and \(max-width: 1180px\)/);
  assert.doesNotMatch(cssSource, /@media \(max-width: 767px\)/);
});

test("navbar width follows the content width and compact state is constrained", () => {
  assert.match(cssSource, /\.site-header\s*{[^}]*width: var\(--content-width\)/s);
  assert.match(cssSource, /\.site-header\.is-compact\s*{[^}]*width: 462px/s);
  assert.match(cssSource, /\.site-header\.is-compact\s*{[^}]*width: min\(462px, var\(--content-width\)\)/s);
});

test("text spacing avoids negative letter spacing", () => {
  assert.doesNotMatch(cssSource, /letter-spacing:\s*-/);
});

test("intro loader mirrors the requested grendev-style opening experience", () => {
  assert.match(pageSource, /import \{ introSteps, profileImages \} from "\.\/data\/profile"/);
  assert.match(profileDataSource, /export const introSteps = \[/);
  ["Frontend", "Backend", "System", "UI/UX"].forEach((label) => {
    assert.match(profileDataSource, new RegExp(`label: "${label}"`));
  });
  ["code", "data", "cmd", "palette"].forEach((icon) => {
    assert.match(profileDataSource, new RegExp(`icon: "${icon}"`));
  });
  assert.doesNotMatch(profileDataSource, /\{ label: "Home", icon: "01" \}/);
  assert.match(pageSource, /function IntroLoader/);
  assert.match(pageSource, /function LoaderStepIcon/);
  assert.match(pageSource, /<LoaderStepIcon icon=\{step\.icon\} \/>/);
  assert.match(cssSource, /\.loader-step-icon\s*{/);
  assert.match(pageSource, /Initializing profile/);
  assert.match(pageSource, /Personal Dashboard/);
  assert.match(pageSource, /loader-scan-line/);
  assert.match(pageSource, /loader-progress-fill/);
  assert.match(cssSource, /\.intro-loader\s*{/);
  assert.match(cssSource, /\.intro-loader\.is-leaving\s*{[^}]*filter: blur/s);
  assert.match(cssSource, /\.intro-loader\s*{[^}]*var\(--bg-base\)/s);
  assert.match(cssSource, /\.intro-loader\s*{[^}]*var\(--accent-violet\)/s);
  assert.match(cssSource, /\.loader-progress-fill\s*{[^}]*var\(--accent-violet\)/s);
  assert.match(cssSource, /@keyframes loader-progress/);
});

test("all image assets are registered with source data", () => {
  [
    ['homePhoto', '"/assets/home-photo.jpg"', "4000", "3000"],
    ['profilePhoto', '"/assets/profile-photo.jpg"', "815", "1280"],
    ['skipperAvatar', '"/assets/skipper-avatar.png"', "826", "1325"],
    ['skipperBackground', '"/assets/skipper-background.png"', "960", "572"]
  ].forEach(([key, src, width, height]) => {
    assert.match(profileDataSource, new RegExp(`${key}: \\{`));
    assert.match(profileDataSource, new RegExp(`src: ${src}`));
    assert.match(profileDataSource, new RegExp(`naturalWidth: ${width}`));
    assert.match(profileDataSource, new RegExp(`naturalHeight: ${height}`));
  });

  assert.match(pageSource, /profileImages\.homePhoto\.src/);
  assert.match(pageSource, /profileImages\.profilePhoto\.src/);
});
