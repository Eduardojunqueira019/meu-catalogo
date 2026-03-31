const cheerio = require('cheerio');
async function test() {
  const url = 'https://agenciacamposveiculos.com.br/carros/Hyundai/Hb20s/16-Comfort-Plus-16v-Flex-4p-Automatico/Hyundai-Hb20s-16-Comfort-Plus-16v-Flex-4p-Automatico-2015-Paragua%C3%A7u-Minas-Gerais-7931832.html';
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html"
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const imgs = [];
  $('img').each((i, el) => {
     let src = $(el).attr('data-src') || $(el).attr('src');
     if (src && src.length > 20) {
        imgs.push(src);
     }
  });
  console.log([...new Set(imgs)].filter(v => v.includes('veiculos') || v.includes('carros') || v.includes('fotos')).slice(0,10));
}
test();
