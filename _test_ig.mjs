fetch('https://igram.world/js/app.js?id=f95b2ae60a607ddad501dbcd7cc73ddb').then(r => r.text()).then(t => {
  console.log(t.match(/(["'])(?:\\.|[^\\])*?\1/g).filter(s => s.includes('/api/')));
}).catch(console.error);
