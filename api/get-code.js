export default async function handler(req, res) {
    // Vercel sẽ tự động lấy các biến này từ phần Environment Variables bạn cài đặt
    const API_KEY = process.env.JSONBIN_API_KEY;
    const BIN_ID = process.env.JSONBIN_PASS_BIN_ID;

    // Lấy thông tin nguồn truy cập
    const referer = req.headers.referer || '';
    const accessKey = req.query.access;

    // Kiểm tra điều kiện: Phải từ link4sub hoặc có mã access hợp lệ
    if (accessKey !== 'true' && !referer.toLowerCase().includes('link4sub')) {
        return res.status(403).json({ 
            error: "Bạn không thể dán trực tiếp link này. Hãy làm nhiệm vụ!" 
        });
    }

    try {
        // Gửi yêu cầu bí mật đến JSONBin
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