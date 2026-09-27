import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router";
import "./styles/index.css";
import { MedicalServices } from "./app/screens/MedicalServices";
import { AppContainer } from "./app/components/AppContainer";
import { useAuthStore } from "./app/store/authStore";
const IMG = [
  "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&q=70",
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=70",
];
const services = [
  { service_key: "laboratory", name: "آزمایشگاه", description: "آزمایش در منزل" },
  { service_key: "pharmacy", name: "داروخانه", description: "سفارش دارو" },
];
const providers = {
  labs: [
    { provider_id: 1, name: "آزمایشگاه پاتوبیولوژی دکتر رضوی", city: "مشهد", rating: 4.8, image: IMG[0] },
    { provider_id: 2, name: "آزمایشگاه نور", city: "تهران", rating: 4.5 },
  ],
  pharmacies: [
    { provider_id: 3, name: "داروخانه شبانه‌روزی دکتر احمدی", city: "مشهد", rating: 4.9, image: IMG[1] },
    { provider_id: 4, name: "داروخانه سلامت", city: "مشهد", rating: 4.2 },
  ],
};
const realFetch = window.fetch;
window.fetch = (async (u: any, o: any) => {
  const url = String(u);
  if (url.endsWith("/api/user/services")) return new Response(JSON.stringify({ status: "success", data: services }));
  if (url.endsWith("/api/user/providers")) return new Response(JSON.stringify({ status: "success", data: providers }));
  if (url.includes('api.mediraai.com')) return new Response(JSON.stringify({ success: true, status: 'success', data: {} }));
  return realFetch(u, o);
}) as any;
useAuthStore.setState({ accessToken: 'test' });
document.body.innerHTML = '<div id="t"></div>';
createRoot(document.getElementById("t")!).render(<MemoryRouter initialEntries={["/services"]}><AppContainer showNavbar><MedicalServices /></AppContainer></MemoryRouter>);

setTimeout(() => {
  const h = [...document.querySelectorAll("h2")].find((e) => e.textContent?.includes("آزمایشگاه‌های برتر"));
  h?.scrollIntoView({ block: "start" });
}, 2500);
