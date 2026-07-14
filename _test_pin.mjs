const url = 'https://rasyad-fajar.com/proxy.php?action=proxy&url=https://pin.it/1y8SZ8jGu';
fetch(url)
  .then(r => r.text())
  .then(t => {
    const vMatch = t.match(/v-766\.pinimg\.com[^"']+\.mp4/);
    const m3u8Match = t.match(/v-766\.pinimg\.com[^"']+\.m3u8/);
    const mMatch2 = t.match(/https:\/\/[a-zA-Z0-9-]+\.pinimg\.com\/v[a-zA-Z0-9/_-]+\.mp4/);
    const imgs = t.match(/https:\/\/i\.pinimg\.com\/originals\/[a-zA-Z0-9/_-]+\.(?:jpg|jpeg|png|webp)/g);
    
    console.log('pinimg mp4:', vMatch?.[0] || mMatch2?.[0]);
    console.log('pinimg m3u8:', m3u8Match?.[0]);
    console.log('images:', imgs?.length, imgs?.slice(0,3));
  })
  .catch(e => console.error(e.message));
