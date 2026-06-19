export default async function handler(req, res) {
  const channel = req.query.id || 'hasbroOfficial';
  const url = `https://www.youtube.com/@${channel}/live`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        // Cookie SOCS mới nhất để vượt qua tường chặn Cookie của Google
        'Cookie': 'SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg;'
      },
      redirect: 'follow'
    });

    const html = await response.text();

    // Tìm thẻ canonical chứa link watch
    const canonicalMatch = html.match(/<link rel="canonical" href="(https:\/\/www\.youtube\.com\/watch\?v=[^"]+)">/);
    
    if (canonicalMatch && canonicalMatch[1]) {
      return res.redirect(302, canonicalMatch[1]);
    }

    // Nếu vẫn không tìm thấy, in toàn bộ mã nguồn ra trình duyệt để Debug
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(404).send(`
      <h3 style="color:red;">Lỗi 404: Không tìm thấy link Live</h3>
      <p>IP của Vercel có thể đã bị YouTube bắt xác minh. Dưới đây là mã nguồn HTML thực tế mà YouTube trả về cho Vercel:</p>
      <textarea style="width:100%; height:500px; background:#f4f4f4;">${html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    `);

  } catch (error) {
    res.status(500).send('Lỗi Server: ' + error.message);
  }
}
