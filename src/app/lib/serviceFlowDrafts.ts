import { clearPendingAddressId } from "./pendingAddress";

/**
 * پیش‌نویس فرایند هر خدمت درمانی فقط تا وقتی کاربر داخل همان فرایند است نگه داشته می‌شود
 * (خود صفحهٔ خدمت، یا صفحهٔ آدرس‌ها وقتی از همان خدمت باز شده). با خروج به هر بخش دیگری
 * (خانه، پروفایل، لیست خدمات و ...) پیش‌نویس پاک می‌شود تا ورود بعدی از ابتدا شروع شود.
 */
const SERVICE_FLOW_DRAFTS: { path: string; storageKey: string }[] = [
    { path: "/services/labs", storageKey: "medira:labs-flow-draft" },
    { path: "/services/pharmacy", storageKey: "medira:pharmacy-flow-draft" },
];

function isWithin(pathname: string, base: string) {
    return pathname === base || pathname.startsWith(`${base}/`);
}

/** مسیر فرایندی که کاربر الان داخل آن است؛ صفحهٔ آدرس‌ها جزو فرایندی حساب می‌شود که آن را باز کرده. */
function getActiveFlowPath(pathname: string, state: unknown): string | null {
    if (pathname === "/addresses") {
        const from = (state as { from?: unknown } | null)?.from;
        return typeof from === "string" ? from.split(/[?#]/)[0] : null;
    }
    return pathname;
}

export function clearInactiveServiceFlowDrafts(pathname: string, state: unknown) {
    const activePath = getActiveFlowPath(pathname, state);
    let insideAnyFlow = false;

    for (const { path, storageKey } of SERVICE_FLOW_DRAFTS) {
        if (activePath && isWithin(activePath, path)) {
            insideAnyFlow = true;
            continue;
        }
        sessionStorage.removeItem(storageKey);
    }

    if (!insideAnyFlow) clearPendingAddressId();
}
