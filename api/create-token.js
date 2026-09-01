import crypto from 'crypto';

export default function handler(req, res) {
    const SECRET_KEY = process.env.SECRET_KEY || 'my_super_secret_key_123';
    
    // 1. Kiểm tra nguồn chuyển hướng (Referer)
    const referer = req.headers.referer || req.headers['sec-fetch-site'] || '';

    // Danh sách các tên miền hợp lệ từ Link4Sub / Trang nhiệm vụ của bạn
    // (Link4Sub thường dùng các domain trung gian như onthitracnghiem.com, link4sub.com...)
    const isAllowed = referer.includes('link4sub') || 
                      referer.includes('onthitracnghiem.com') || 
                      referer.includes('same-origin') || 
                      referer.includes('cross-site');

    // Nếu copy dán trực tiếp (không có referer hợp lệ) -> Báo lỗi ngay
    if (!isAllowed) {
        return res.status(403).send(`
            <h2 style="color: red; text-align: center; margin-top: 50px;">⚠️ TRUY CẬP BỊ CẤM!</h2>
            <p style="text-align: center;">Bạn không thể dán trực tiếp link này để lấy Token. Vui lòng vượt link nhiệm vụ!</p>
        `);
    }

    // 2. Nếu đi từ trang nhiệm vụ sang -> Tạo Token hợp lệ
    const timestamp = Date.now().toString();
    const sig = crypto.createHmac('sha256', SECRET_KEY).update(timestamp).digest('hex');

    // Chuyển hướng về trang chủ
    res.redirect(302, `/?t=${timestamp}&sig=${sig}`);
}