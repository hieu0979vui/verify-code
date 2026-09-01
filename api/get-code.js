import crypto from 'crypto';

export default async function handler(req, res) {
    const API_KEY = process.env.JSONBIN_API_KEY;
    const BIN_ID = process.env.JSONBIN_PASS_BIN_ID;
    const SECRET_KEY = process.env.SECRET_KEY || 'my_super_secret_key_123';

    const { t, sig } = req.query;

    // 1. Kiểm tra xem có đủ thông tin token không
    if (!t || !sig) {
        return res.status(403).json({ error: "Bạn không thể dán trực tiếp link này. Hãy làm nhiệm vụ!" });
    }

    // 2. Kiểm tra thời hạn (Token chỉ có hiệu lực trong 120 giây / 2 phút)
    const currentTime = Date.now();
    const tokenTime = parseInt(t, 10);
    const maxAge = 120 * 1000; // 120 giây (tính bằng miligiây)

    if (isNaN(tokenTime) || (currentTime - tokenTime) > maxAge || (tokenTime - currentTime) > 5000) {
        return res.status(403).json({ error: "Liên kết lấy mã này đã hết hạn (quá 2 phút). Vui lòng làm lại nhiệm vụ!" });
    }

    // 3. Kiểm tra tính hợp lệ của chữ ký HMAC (Xác minh xem token có bị ai sửa đổi không)
    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(t).digest('hex');
    if (sig !== expectedSig) {
        return res.status(403).json({ error: "Mã token không hợp lệ hoặc đã bị thay đổi!" });
    }

    // 4. Lấy mã từ JSONBin nếu token hợp lệ
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': API_KEY,
                'X-Bin-Meta': 'false'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return res.status(200).json({ code: data.code || "KHONG_CO_MA" });
        } else {
            return res.status(500).json({ error: "Lỗi cấu hình JSONBin" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Lỗi kết nối máy chủ" });
    }
}
