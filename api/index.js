export default async function handler(req, res) {
  const channel = req.query.id || 'hasbroOfficial';
  const url = `https://www.youtube.com/@${channel}/streams`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        // Header quan trọng nhất để vượt qua màn hình chặn bot/cookie của YouTube trên Vercel
        'Cookie': 'CONSENT=YES+cb.20210328-17.p0.en+FX+478;' 
      }
    });
    
    if (!response.ok) {
      return res.status(500).send('Không thể truy cập YouTube lúc này.');
    }

    const html = await response.text();
    
    // Regex nâng cấp: 
    // - Giới hạn khoảng cách tìm kiếm để không bắt nhầm videoId offline
    // - Bổ sung cờ 's' ở cuối để quét xuyên các dòng (newlines)
    const regex = /"videoId":"([a-zA-Z0-9_-]{11})"(?:(?!"videoId":).)*?"style":"BADGE_STYLE_TYPE_LIVE_NOW"/s;
    const match = regex.exec(html);
    
    if (match && match[1]) {
      const liveUrl = `https://www.youtube.com/watch?v=${match[1]}`;
      res.redirect(302, liveUrl); 
    } else {
      // In ra Title trang để debug xem có đang bị kẹt ở trang nào khác không
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : 'No title';
      
      res.status(404).send(`Kênh @${channel} hiện không có luồng trực tiếp. (Debug - Page Title: ${title})`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi máy chủ nội bộ.');
  }
}
