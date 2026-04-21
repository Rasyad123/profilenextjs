import "./globals.css";

export const metadata = {
  title: "P Link",
  description: "Personal profile links built with Next.js"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
