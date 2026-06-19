import https from 'https';

export default function handler(req, res) {
  const channel = req.query.id || 'hasbroOfficial';
  
  const options = {
    hostname: 'www.youtube.com',
    path: `/@${channel}/live`,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cookie': 'CONSENT=YES+cb.20210328-17.p0.en+FX+478;'
    }
  };

  https.get(options, (youtubeRes) => {
    // TRƯỜNG HỢP 1: YouTube bắt IP Vercel và chuyển hướng HTTP (302/303)
    if ([301, 302, 303, 307, 308].includes(youtubeRes.statusCode) && youtubeRes.headers.location) {
      const loc = youtubeRes.headers.location;
      // Nếu nó chuyển hướng thẳng vào link video
      if (loc.includes('/watch?v=')) {
        return res.redirect(302, loc);
      }
    }

    // TRƯỜNG HỢP 2: YouTube trả về mã HTML, tiến hành bóc tách
    let html = '';
    youtubeRes.on('data', chunk => html += chunk);
    youtubeRes.on('end', () => {
      
      // Tìm thẻ canonical chứa link watch
      const canonicalMatch = html.match(/<link rel="canonical" href="(https:\/\/www\.youtube\.com\/watch\?v=[^"]+)">/);
      if (canonicalMatch && canonicalMatch[1]) {
        return res.redirect(302, canonicalMatch[1]);
      }

      // Fallback: Quét sâu vào cấu trúc JSON ẩn của YouTube để tìm trạng thái isLive
      const videoIdMatch = html.match(/"videoDetails":\{"videoId":"([^"]+)".*?"isLive":true/);
      if (videoIdMatch && videoIdMatch[1]) {
        return res.redirect(302, `https://www.youtube.com/watch?v=${videoIdMatch[1]}`);
      }

      // Trả về 404 kèm thông tin debug nếu kênh thực sự không live
      res.status(404).send(`Kênh @${channel} không có luồng trực tiếp. (Status Code: ${youtubeRes.statusCode})`);
    });

  }).on('error', (e) => {
    console.error(e);
    res.status(500).send('Lỗi kết nối tới YouTube: ' + e.message);
  });
}
