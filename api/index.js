export default async function handler(req, res) {
  // Lấy tên kênh từ query URL (mặc định là hasbroOfficial nếu không truyền vào)
  const channel = req.query.id || 'hasbroOfficial';
  const url = `https://www.youtube.com/@${channel}/streams`;

  try {
    // Tải mã nguồn trang /streams
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      return res.status(500).send('Không thể truy cập YouTube lúc này.');
    }

    const html = await response.text();
    
    // Quét Regex tìm Video ID đang có huy hiệu "LIVE NOW"
    const match = html.match(/"videoId":"([^"]+)".*?"style":"BADGE_STYLE_TYPE_LIVE_NOW"/);
    
    if (match && match[1]) {
      const liveUrl = `https://www.youtube.com/watch?v=${match[1]}`;
      // Chuyển hướng người xem thẳng đến link trực tiếp
      res.redirect(302, liveUrl); 
    } else {
      res.status(404).send(`Kênh @${channel} hiện không có luồng nào đang phát trực tiếp.`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi máy chủ nội bộ.');
  }
}