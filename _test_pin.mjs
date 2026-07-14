const url = 'https://rasyad-fajar.com/proxy.php?action=proxy&url=https://pin.it/3QLKWxad9';
fetch(url)
  .then(r => r.text())
  .then(t => {
    const origMatch = t.match(/"orig":\s*\{"url":"([^"]+)"/);
    const metaOgImage = t.match(/<meta[^>]+property="og:image"[^>]*>/i) || t.match(/<meta[^>]+name="og:image"[^>]*>/i);
    const ogImgMatch = metaOgImage ? metaOgImage[0].match(/content="([^"]+)"/i) : null;
    const pinImgMatch = t.match(/https:\/\/i\.pinimg\.com\/(?:originals|736x)\/[a-zA-Z0-9/_-]+\.(?:jpg|jpeg|png|webp)/gi);

    console.log('orig:', origMatch?.[1]);
    console.log('og:', ogImgMatch?.[1]);
    console.log('pinimg:', pinImgMatch);
  })
  .catch(e => console.error(e.message));
