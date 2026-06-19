import express from 'express';

const app = express();
// Render sẽ tự động gán cổng mạng thông qua biến môi trường PORT
const PORT = process.env.PORT || 3000;

app.get('/api', async (req, res) => {
  const channel = req.query.id || 'hasbroOfficial';
  const url = `https://www.youtube.com/@${channel}/live`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': 'SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg;'
      },
      redirect: 'follow'
    });

    // 1. Nếu fetch tự động theo luồng chuyển hướng của YouTube
    if (response.url && response.url.includes('/watch?v=')) {
      return res.redirect(302, response.url);
    }

    const html = await response.text();

    // 2. Tìm thẻ Canonical
    const canonicalMatch = html.match(/<link rel="canonical" href="(https:\/\/www\.youtube\.com\/watch\?v=[^"]+)">/);
    if (canonicalMatch && canonicalMatch[1]) {
      return res.redirect(302, canonicalMatch[1]);
    }

    // 3. Fallback: Tìm biến JSON ẩn
    const videoIdMatch = html.match(/"videoDetails":\{"videoId":"([^"]+)".*?"isLive":true/);
    if (videoIdMatch && videoIdMatch[1]) {
      return res.redirect(302, `https://www.youtube.com/watch?v=${videoIdMatch[1]}`);
    }

    // Nếu không có, báo lỗi
    res.status(404).send(`Kênh @${channel} hiện không có luồng trực tiếp.`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi máy chủ nội bộ: ' + error.message);
  }
});

// Chạy server
app.listen(PORT, () => {
  console.log(`Server IPTV Redirect đang chạy trên cổng ${PORT}`);
});
