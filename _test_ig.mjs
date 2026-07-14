fetch('https://www.instagram.com/reel/DZjsingyA6n/embed/').then(r => r.text()).then(t => {
  const match = t.match(/video_url\\?":\\?"(https:[^"\\]+)/);
  if (match) console.log("VIDEO:", match[1]);
  else console.log("NO VIDEO URL", t.substring(0, 500));
}).catch(console.error);
