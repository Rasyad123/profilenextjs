const url = 'https://rasyad-fajar.com/proxy.php?action=proxy&url=https://pin.it/ly8SZ8jGu';
fetch(url)
  .then(r => r.text())
  .then(t => {
    const og = t.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    const orig = t.match(/"orig":\s*\{"url":"([^"]+)"/);
    const pin = t.match(/https:\/\/i\.pinimg\.com\/originals\/[^"'\s]+/);
    const og236 = t.match(/https:\/\/i\.pinimg\.com\/236x\/[^"'\s]+/);
    const og736 = t.match(/https:\/\/i\.pinimg\.com\/736x\/[^"'\s]+/);
    console.log('og:image:', og?.[1]?.substring(0,120));
    console.log('orig:', orig?.[1]?.substring(0,120));
    console.log('pinimg originals:', pin?.[0]?.substring(0,120));
    console.log('pinimg 236x:', og236?.[0]?.substring(0,120));
    console.log('pinimg 736x:', og736?.[0]?.substring(0,120));
    console.log('html length:', t.length);
  })
  .catch(e => console.error(e.message));
