const BASE_URL = 'http://185.222.163.113:7000/api/owner';



export const labAuthService = {

    async sendOtp(phone: string): Promise<void> {
        const res = await fetch(`${BASE_URL}/lab/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ phone }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? 'خطا در ارسال کد تأیید');
    },

    async verifyOtp(phone: string, code: string): Promise<{ token: string; user: Record<string, unknown> }> {
        const res = await fetch(`${BASE_URL}/lab/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ phone, code }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? 'کد تأیید نادرست است');

        // ساختار: { status: true, data: { access_token, user } }
        return {
            token: data.data.access_token,
            user: data.data.user ?? {},
        };
    },
    async getLabProfile(token: string) {
        const res = await fetch(`${BASE_URL}/lab/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        });
        if (!res.ok) throw new Error('خطا در دریافت پروفایل');
        return res.json();
    },
};
