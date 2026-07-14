"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";

// ── Platform detection ──────────────────────────────────────────────────────

function detectPlatform(url) {
  const u = url.trim().toLowerCase();
  if (u.includes("tiktok.com") || u.includes("vm.tiktok") || u.includes("vt.tiktok")) return "tiktok";
  if (u.includes("instagram.com") || u.includes("instagr.am")) return "instagram";
  if (u.includes("pinterest.com") || u.includes("pin.it") || u.includes("pinterest.co")) return "pinterest";
  if (u.includes("youtube.com") || u.includes("youtu.be") || u.includes("music.youtube")) return "youtube";
  if (u.includes("facebook.com") || u.includes("fb.watch") || u.includes("fb.com")) return "facebook";
  return null;
}

function formatNum(n) {
  if (n == null || n === 0) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// Check if proxy.php is available (production cPanel with PHP)
let _proxyAvailable = null;
async function isProxyAvailable() {
  if (_proxyAvailable !== null) return _proxyAvailable;
  try {
    const res = await fetch("/proxy.php?action=ping", { method: "HEAD" });
    const ct = res.headers.get("content-type") || "";
    // If content-type is JSON, PHP is executing (even if it returns 400 for invalid action)
    _proxyAvailable = ct.includes("application/json");
  } catch {
    _proxyAvailable = false;
  }
  return _proxyAvailable;
}

// ── API calls ───────────────────────────────────────────────────────────────

function buildTikTokResult(data) {
  // tikwm returns relative URLs like /video/... — need to make them absolute
  const fix = (u) => u && u.startsWith("/") ? `https://tikwm.com${u}` : u;
  const items = [];
  if (data.hdplay) items.push({ label: "Video HD", url: fix(data.hdplay), ext: "mp4", quality: "HD" });
  if (data.play) items.push({ label: "Video SD", url: fix(data.play), ext: "mp4", quality: "SD" });
  if (data.music) items.push({ label: "Audio MP3", url: fix(data.music), ext: "mp3", quality: "MP3" });
  return {
    platform: "tiktok",
    title: data.title || "TikTok Video",
    author: "@" + (data.author?.unique_id || data.author?.nickname || "user"),
    thumbnail: fix(data.cover),
    duration: data.duration,
    stats: {
      plays: data.play_count,
      likes: data.digg_count,
      comments: data.comment_count,
    },
    items,
  };
}

async function fetchTikTok(url) {
  const useProxy = await isProxyAvailable();

  if (useProxy) {
    // Production: proxy.php resolves full URLs server-side via curl
    const res = await fetch(`/proxy.php?action=tiktok&url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error("Gagal menghubungi server TikTok");
    const { code, data, msg } = await res.json();
    if (code !== 0 || !data) throw new Error(msg || "Gagal mengambil video TikTok");
    return buildTikTokResult(data);
  }

  // Localhost fallback: call tikwm directly (supports CORS)
  const res = await fetch("https://tikwm.com/api/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ url, web: 1, hd: 1 }),
  });
  if (!res.ok) throw new Error("Gagal menghubungi server TikTok");
  const { code, data, msg } = await res.json();
  if (code !== 0 || !data) throw new Error(msg || "Gagal mengambil video TikTok. Coba gunakan link pendek (vt.tiktok.com/...).");
  return buildTikTokResult(data);
}

function buildInstagramResult(html, url) {
  const mediaMatches = [
    ...html.matchAll(/href=["'](https:\/\/[^"']*?\.(?:mp4|jpg|jpeg|png|webp)[^"']*?)["']/gi),
  ];
  const thumbMatch = html.match(/src=["'](https:\/\/[^"']+?\.(?:jpg|jpeg|png|webp)[^"']*?)["']/i);

  if (!mediaMatches.length) {
    throw new Error("Tidak dapat menemukan media. Pastikan postingan bersifat publik dan link benar.");
  }

  const seen = new Set();
  const items = mediaMatches
    .map((m) => m[1])
    .filter((u) => {
      if (seen.has(u)) return false;
      seen.add(u);
      return true;
    })
    .slice(0, 6)
    .map((u, i) => {
      const isVideo = u.includes(".mp4");
      return {
        label: isVideo ? `Video ${i + 1}` : `Gambar ${i + 1}`,
        url: u,
        ext: isVideo ? "mp4" : "jpg",
        quality: "Original",
      };
    });

  const authorMatch = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return {
    platform: "instagram",
    title: "Instagram Post",
    author: authorMatch ? `/${authorMatch[1]}` : "Instagram",
    thumbnail: thumbMatch?.[1] || null,
    items,
  };
}

async function fetchInstagram(url) {
  const useProxy = await isProxyAvailable();

  if (useProxy) {
    // Production: PHP proxy calls igram server-side
    const res = await fetch(`/proxy.php?action=instagram&url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error("Gagal menghubungi server Instagram");
    const html = await res.text();
    return buildInstagramResult(html, url);
  }

  // Localhost fallback: direct call to igram
  const res = await fetch("https://igram.world/api/ajaxSearch", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
      "Referer": "https://igram.world/",
    },
    body: new URLSearchParams({ q: url, lang: "en" }),
  });
  if (!res.ok) throw new Error("Gagal menghubungi server Instagram");
  const html = await res.text();
  return buildInstagramResult(html, url);
}

async function fetchPinterest(url) {
  const useProxy = await isProxyAvailable();
  const fetchUrl = useProxy
    ? `/proxy.php?action=proxy&url=${encodeURIComponent(url)}`
    : `https://corsproxy.io/?${encodeURIComponent(url)}`;
  const res = await fetch(fetchUrl);
  if (!res.ok) throw new Error("Gagal mengambil konten Pinterest");
  const html = await res.text();

  // Ekstrak URL Video (jika ada)
  const videoMatch = html.match(/https:\/\/[a-zA-Z0-9-]+\.pinimg\.com\/[^"'\s]+\.mp4/i);
  
  // Ekstrak URL Gambar menggunakan meta og:image (lebih akurat)
  const metaOgImage = html.match(/<meta[^>]+property="og:image"[^>]*>/i) || html.match(/<meta[^>]+name="og:image"[^>]*>/i);
  const ogImgMatch = metaOgImage ? metaOgImage[0].match(/content="([^"]+)"/i) : null;
  const origMatch = html.match(/"orig":\s*\{"url":"([^"]+)"/);
  const pinImgMatch = html.match(/https:\/\/i\.pinimg\.com\/originals\/[a-zA-Z0-9/_-]+\.(?:jpg|jpeg|png|webp)/gi);
  const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);

  // Ambil gambar fallback dari originals (abaikan yang pertama jika itu gradient placeholder 'd53b01...')
  let fallbackImg = null;
  if (pinImgMatch && pinImgMatch.length > 0) {
    fallbackImg = pinImgMatch.find(img => !img.includes('d53b01')) || pinImgMatch[0];
  }

  let rawImg = ogImgMatch?.[1] || origMatch?.[1] || fallbackImg;
  const videoUrl = videoMatch?.[0];

  if (!rawImg && !videoUrl) {
    throw new Error("Tidak dapat mengekstrak media dari Pinterest. Coba link pin langsung.");
  }

  const items = [];
  
  // Jika ada video, tambahkan ke list download
  if (videoUrl) {
    const cleanVid = videoUrl.replace(/\\u002F/g, "/").replace(/\\\//g, "/").split(/["')\s]/)[0];
    items.push({ label: "Download Video", url: cleanVid, ext: "mp4", quality: "HD" });
  }

  // Bersihkan sisa-sisa karakter URL gambar dan tambahkan ke list
  let imgUrl = null;
  if (rawImg) {
    rawImg = rawImg.replace(/\\u002F/g, "/").replace(/\\\//g, "/");
    imgUrl = rawImg.split(/["')\s]/)[0];
    // Jika dari og:image 736x, usahakan ubah ke originals untuk kualitas maksimal (opsional)
    const hiResImg = imgUrl.replace('/736x/', '/originals/').replace('/236x/', '/originals/');
    items.push({ label: "Download Gambar", url: hiResImg, ext: "jpg", quality: "Original" });
  }

  const title = ogTitleMatch?.[1] || "Pinterest Pin";

  return {
    platform: "pinterest",
    title,
    author: "Pinterest",
    thumbnail: imgUrl || "https://s.pinimg.com/images/favicon.png",
    items,
  };
}

async function fetchYouTube(url) {
  const useProxy = await isProxyAvailable();
  const apiUrl = useProxy
    ? `/proxy.php?action=proxy&url=${encodeURIComponent("https://api.cobalt.tools/")}`
    : "https://api.cobalt.tools/";

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      url,
      videoQuality: "1080",
      filenameStyle: "pretty",
      downloadMode: "auto",
    }),
  });
  if (!res.ok) throw new Error("Gagal menghubungi server YouTube");
  const data = await res.json();

  if (data.status === "error") throw new Error(data.error?.code || "Gagal mengambil video YouTube");

  const vidIdMatch = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  const videoId = vidIdMatch?.[1];
  const thumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;

  const items = [];
  if (data.status === "picker" && Array.isArray(data.picker)) {
    data.picker.slice(0, 4).forEach((item, i) => {
      items.push({
        label: item.type === "photo" ? `Gambar ${i + 1}` : `Video ${i + 1}`,
        url: item.url,
        ext: item.type === "photo" ? "jpg" : "mp4",
        quality: item.quality || "Original",
      });
    });
  } else if (data.url) {
    items.push({ label: "Video 1080p", url: data.url, ext: "mp4", quality: "1080p" });
    // Audio only
    try {
      const res3 = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ url, filenameStyle: "pretty", downloadMode: "audio" }),
      });
      const d3 = await res3.json();
      if (d3.url) items.push({ label: "Audio MP3", url: d3.url, ext: "mp3", quality: "MP3" });
    } catch { /* ignore */ }
  } else {
    throw new Error("Tidak dapat mengambil video YouTube. Pastikan video bersifat publik.");
  }

  if (!items.length) throw new Error("Tidak ada media yang bisa diunduh dari video ini.");

  return {
    platform: "youtube",
    title: data.filename?.replace(/\.[^.]+$/, "") || "YouTube Video",
    author: videoId ? `youtube.com/watch?v=${videoId}` : "YouTube",
    thumbnail,
    items,
  };
}

async function fetchFacebook(url) {
  const useProxy = await isProxyAvailable();
  const fetchUrl = useProxy
    ? `/proxy.php?action=proxy&url=${encodeURIComponent(url)}`
    : `https://corsproxy.io/?${encodeURIComponent(url)}`;
  const res = await fetch(fetchUrl);
  if (!res.ok) throw new Error("Gagal mengambil halaman Facebook");
  const html = await res.text();

  const hdRaw = html.match(/"playable_url_quality_hd":"([^"]+)"/) ||
                html.match(/hd_src:\s*"([^"]+)"/) ||
                html.match(/"hd_src":"([^"]+)"/);
  const sdRaw = html.match(/"playable_url":"([^"]+)"/) ||
                html.match(/sd_src:\s*"([^"]+)"/) ||
                html.match(/"sd_src":"([^"]+)"/);
  const ogThumb = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
  const ogDesc  = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);

  const clean = (raw) => raw?.[1]?.replace(/\\\//g, "/").replace(/\\u0025/g, "%").replace(/\\"/g, "") || null;

  const hdUrl = clean(hdRaw);
  const sdUrl = clean(sdRaw);

  if (!hdUrl && !sdUrl) {
    throw new Error("Tidak dapat menemukan video. Pastikan video Facebook bersifat publik dan link benar.");
  }

  const items = [];
  if (hdUrl) items.push({ label: "Video HD", url: hdUrl, ext: "mp4", quality: "HD" });
  if (sdUrl && sdUrl !== hdUrl) items.push({ label: "Video SD", url: sdUrl, ext: "mp4", quality: "SD" });

  return {
    platform: "facebook",
    title: ogTitle?.[1] || ogDesc?.[1]?.slice(0, 80) || "Facebook Video",
    author: url.match(/facebook\.com\/([^/?#]+)/)?.[1] || "Facebook",
    thumbnail: ogThumb?.[1] || null,
    items,
  };
}

async function fetchMedia(rawUrl) {
  const url = rawUrl.trim();
  const platform = detectPlatform(url);
  if (!platform) throw new Error("URL tidak dikenali. Paste link dari TikTok, Instagram, Pinterest, YouTube, atau Facebook.");
  if (platform === "tiktok")    return fetchTikTok(url);
  if (platform === "instagram") return fetchInstagram(url);
  if (platform === "pinterest") return fetchPinterest(url);
  if (platform === "youtube")   return fetchYouTube(url);
  if (platform === "facebook")  return fetchFacebook(url);
}

async function triggerDownload(url, filename) {
  try {
    const useProxy = await isProxyAvailable();
    const dlUrl = useProxy
      ? `/proxy.php?action=download&url=${encodeURIComponent(url)}`
      : url;
    const res = await fetch(dlUrl);
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
  } catch {
    window.open(url, "_blank", "noreferrer");
  }
}

// ── Icons ───────────────────────────────────────────────────────────────────

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.63a8.22 8.22 0 004.82 1.55V6.73a4.85 4.85 0 01-1.05-.04z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function DownloadIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Platform config ─────────────────────────────────────────────────────────

const PLATFORMS = {
  tiktok: {
    label: "TikTok",
    Icon: TikTokIcon,
    color: "#20d5ec",
    bg: "rgba(32,213,236,0.08)",
    border: "rgba(32,213,236,0.25)",
    glow: "rgba(32,213,236,0.14)",
  },
  instagram: {
    label: "Instagram",
    Icon: InstagramIcon,
    color: "#e1306c",
    bg: "rgba(225,48,108,0.08)",
    border: "rgba(225,48,108,0.25)",
    glow: "rgba(225,48,108,0.14)",
  },
  pinterest: {
    label: "Pinterest",
    Icon: PinterestIcon,
    color: "#ff4a60",
    bg: "rgba(255,74,96,0.08)",
    border: "rgba(255,74,96,0.25)",
    glow: "rgba(255,74,96,0.14)",
  },
  youtube: {
    label: "YouTube",
    Icon: YouTubeIcon,
    color: "#ff0000",
    bg: "rgba(255,0,0,0.08)",
    border: "rgba(255,0,0,0.25)",
    glow: "rgba(255,0,0,0.14)",
  },
  facebook: {
    label: "Facebook",
    Icon: FacebookIcon,
    color: "#1877f2",
    bg: "rgba(24,119,242,0.08)",
    border: "rgba(24,119,242,0.25)",
    glow: "rgba(24,119,242,0.14)",
  },
};

// ── Main Page ───────────────────────────────────────────────────────────────

export default function DownloadPage() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef(null);

  const platform = detectPlatform(url);
  const platformInfo = platform ? PLATFORMS[platform] : null;
  const isLoading = status === "loading";

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      const trimmed = url.trim();
      if (!trimmed || isLoading) return;
      setStatus("loading");
      setResult(null);
      setErrorMsg("");
      try {
        const data = await fetchMedia(trimmed);
        setResult(data);
        setStatus("success");
      } catch (err) {
        setErrorMsg(err.message || "Terjadi kesalahan. Coba lagi.");
        setStatus("error");
      }
    },
    [url, isLoading]
  );

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text.trim());
      inputRef.current?.focus();
    } catch {
      inputRef.current?.focus();
    }
  }, []);

  const handleClear = useCallback(() => {
    setUrl("");
    setResult(null);
    setStatus("idle");
    setErrorMsg("");
    inputRef.current?.focus();
  }, []);

  return (
    <div className="dl-shell">
      <div className="bg-orb orb-one" aria-hidden="true" />
      <div className="bg-orb orb-two" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />

      <Link href="/" className="dl-back-btn">
        <ArrowLeftIcon />
        <span>Kembali</span>
      </Link>

      <main className="dl-main" id="dl-main">

        {/* Hero */}
        <header className="dl-hero">
          <span className="section-kicker">Social Media Downloader</span>
          <h1 className="dl-title">
            Download Konten
            <span className="dl-title-gradient"> Tanpa Ribet.</span>
          </h1>
          <p className="dl-subtitle">
            Paste link dari TikTok, Instagram, atau Pinterest.
            <br />
            Download gratis, cepat, tanpa login.
          </p>

          <div className="dl-chips" role="list" aria-label="Platform yang didukung">
            {Object.entries(PLATFORMS).map(([key, p]) => (
              <div
                key={key}
                className="dl-chip"
                role="listitem"
                style={{ "--chip-color": p.color, "--chip-border": p.border, "--chip-bg": p.bg }}
              >
                <p.Icon />
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        </header>

        {/* Input card */}
        <section className="dl-card dl-input-card" aria-label="URL input">
          <form onSubmit={handleSubmit} noValidate>
            <div className="dl-input-row">
              <div
                className="dl-input-wrap"
                style={
                  platformInfo
                    ? { "--focus-color": platformInfo.color, "--focus-glow": platformInfo.glow, borderColor: platformInfo.border }
                    : {}
                }
              >
                <span className="dl-input-icon" style={platformInfo ? { color: platformInfo.color } : {}} aria-hidden="true">
                  {platformInfo ? <platformInfo.Icon /> : <LinkIcon />}
                </span>
                <input
                  ref={inputRef}
                  id="media-url-input"
                  type="url"
                  className="dl-input"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); if (status !== "idle") setStatus("idle"); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(e); }}
                  placeholder="Paste link TikTok, Instagram, atau Pinterest..."
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="URL media"
                />
                {url && (
                  <button type="button" className="dl-clear-btn" onClick={handleClear} aria-label="Hapus URL">
                    <XIcon />
                  </button>
                )}
              </div>
              <button
                type="button"
                id="paste-btn"
                className="dl-paste-btn"
                onClick={handlePaste}
                aria-label="Paste dari clipboard"
              >
                Paste
              </button>
            </div>

            {platformInfo && (
              <div
                className="dl-detected"
                style={{ "--chip-color": platformInfo.color, borderColor: platformInfo.border, background: platformInfo.bg }}
                aria-live="polite"
              >
                <platformInfo.Icon />
                <span>{platformInfo.label} terdeteksi</span>
                <span className="dl-detected-dot" aria-hidden="true" />
              </div>
            )}

            <button
              type="submit"
              id="fetch-media-btn"
              className={`dl-fetch-btn ${isLoading ? "is-loading" : ""}`}
              disabled={!url.trim() || isLoading}
              style={platformInfo ? { "--btn-accent": platformInfo.color, "--btn-glow": platformInfo.glow } : {}}
            >
              {isLoading ? (
                <>
                  <span className="dl-spinner" aria-hidden="true" />
                  <span>Mengambil media...</span>
                </>
              ) : (
                <>
                  <DownloadIcon size={20} />
                  <span>Ambil Link Download</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Error */}
        {status === "error" && (
          <div className="dl-card dl-error-card" role="alert" aria-live="assertive">
            <span className="dl-error-emoji" aria-hidden="true">⚠️</span>
            <div>
              <strong>Gagal mengambil media</strong>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {status === "success" && result && <ResultCard result={result} />}

        {/* Tips */}
        <aside className="dl-tips">
          <span className="dl-tips-title"><span aria-hidden="true">💡</span> Tips</span>
          <ul>
            <li>Pastikan akun yang akan didownload bersifat <strong>publik</strong></li>
            <li><strong>TikTok</strong>: tap Share → Salin Tautan</li>
            <li><strong>Instagram</strong>: ··· → Salin Tautan (post/reel publik)</li>
            <li><strong>Pinterest</strong>: salin link dari browser atau app Pinterest</li>
          </ul>
        </aside>

      </main>
    </div>
  );
}

// ── Result Card ─────────────────────────────────────────────────────────────

function ResultCard({ result }) {
  const [dlState, setDlState] = useState({});
  const info = PLATFORMS[result.platform];

  const handleDownload = useCallback(
    async (item, index) => {
      if (dlState[index]) return;
      setDlState((prev) => ({ ...prev, [index]: "loading" }));
      await triggerDownload(item.url, `${result.platform}-${Date.now()}.${item.ext}`);
      setDlState((prev) => ({ ...prev, [index]: "done" }));
      setTimeout(() => setDlState((prev) => ({ ...prev, [index]: undefined })), 2500);
    },
    [dlState, result.platform]
  );

  return (
    <section
      className="dl-card dl-result-card"
      aria-label="Hasil download"
      style={info ? { "--result-color": info.color, "--result-glow": info.glow } : {}}
    >
      <div className="dl-result-header">
        {info && (
          <span className="dl-result-platform" style={{ color: info.color }}>
            <info.Icon />
            <span>{info.label}</span>
          </span>
        )}
        <span className="dl-result-badge">Siap Download</span>
      </div>

      <div className="dl-result-body">
        {result.thumbnail && (
          <div className="dl-thumb-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.thumbnail}
              alt={result.title}
              className="dl-thumb"
              loading="lazy"
              onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
            />
            <div className="dl-thumb-overlay" aria-hidden="true" />
          </div>
        )}

        <div className="dl-result-info">
          <h2 className="dl-result-title">{result.title}</h2>
          <span className="dl-result-author">{result.author}</span>

          {result.stats && (
            <div className="dl-stats" aria-label="Video stats">
              {result.stats.plays != null && <span title="Views">▶ {formatNum(result.stats.plays)}</span>}
              {result.stats.likes != null && <span title="Likes">♥ {formatNum(result.stats.likes)}</span>}
              {result.stats.comments != null && <span title="Comments">💬 {formatNum(result.stats.comments)}</span>}
            </div>
          )}

          <div className="dl-download-list" role="list">
            {result.items.map((item, i) => {
              const state = dlState[i];
              return (
                <button
                  key={i}
                  type="button"
                  id={`download-item-${i}`}
                  role="listitem"
                  className={`dl-dl-btn${state === "loading" ? " is-loading" : ""}${state === "done" ? " is-done" : ""}`}
                  onClick={() => handleDownload(item, i)}
                  disabled={state === "loading"}
                  aria-label={`Download ${item.label}`}
                >
                  <span className="dl-dl-btn-icon" aria-hidden="true">
                    {state === "done" ? <CheckIcon /> : state === "loading" ? <span className="dl-spinner dl-spinner-sm" /> : <DownloadIcon size={16} />}
                  </span>
                  <span className="dl-dl-btn-label">{item.label}</span>
                  <span className="dl-quality-tag">{item.quality}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
