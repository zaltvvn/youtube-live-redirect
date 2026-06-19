export default async function handler(req, res) {
  const channel = req.query.id || 'hasbroOfficial';
  // Thay đổi quan trọng: Gọi thẳng vào endpoint /live thay vì /streams
  const url = `https://www.youtube.com/@${channel}/live`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': 'CONSENT=YES+cb.20210328-17.p0.en+FX+478;'
      },
      // Đảm bảo fetch theo dõi các luồng chuyển hướng của YouTube
      redirect: 'follow' 
    });
    
    if (!response.ok) {
      return res.status(500).send('Không thể truy cập YouTube lúc này.');
    }

    // Trường hợp 1: YouTube tự động chuyển hướng HTTP (302) thẳng đến trang watch
    if (response.url && response.url.includes('/watch?v=')) {
      return res.redirect(302, response.url);
    }

    // Trường hợp 2: Bóc tách thẻ Canonical (Chắc chắn 100% có nếu video tồn tại)
    const html = await response.text();
    const canonicalMatch = html.match(/<link rel="canonical" href="(https:\/\/www\.youtube\.com\/watch\?v=[^"]+)">/);
    
    if (canonicalMatch && canonicalMatch[1]) {
      return res.redirect(302, canonicalMatch[1]);
    } else {
      res.status(404).send(`Kênh @${channel} hiện không có luồng trực tiếp nào.`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi máy chủ nội bộ.');
  }
}
