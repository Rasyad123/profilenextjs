const url = 'https://rasyad-fajar.com/proxy.php?action=proxy&url=https://pin.it/1y8SZ8jGu';
fetch(url)
  .then(r => r.text())
  .then(t => {
    // Let's try more flexible meta matching
    const allMeta = t.match(/<meta[^>]+image[^>]+>/gi);
    console.log('all meta tags with image:', allMeta);
    
    // Check images again
    const imgs = t.match(/https:\/\/i\.pinimg\.com\/originals\/[a-zA-Z0-9/_-]+\.(?:jpg|jpeg|png|webp)/g);
    // Find the first one that is NOT the gradient (gradient is usually a specific id or maybe we can just get the last image in the array if there are multiple?)
    console.log('images:', imgs);
  })
  .catch(e => console.error(e.message));
