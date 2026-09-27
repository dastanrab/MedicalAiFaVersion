import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router";
import "./styles/index.css";
import { DoctorList } from "./app/screens/DoctorList";
import { AppContainer } from "./app/components/AppContainer";
const docs = [
  { id: 1, firstName: "تست قلب پلن", lastName: "حرفه‌ای ۱", specialty: "قلب و عروق", rating: "0", reviews: 0, recommendation: 0, visit_count: 0, availability: 1, image: "", tags: [], address: "مشهد، بلوار سجاد، ساختمان پزشکان", gender: 0 },
  { id: 2, firstName: "محمدرضا", lastName: "عبدالهی نیشابوری", specialty: "متخصص داخلی و گوارش", rating: "4.7", reviews: 128, recommendation: 94, visit_count: 1520, availability: 0, image: "", tags: ["ویزیت آنلاین", "مطب"], address: "مشهد، احمدآباد، خیابان عارف", gender: 0 },
];
const realFetch = window.fetch;
window.fetch = (async (u: any, o: any) => String(u).includes("/doctors") ? new Response(JSON.stringify({ success: true, data: docs })) : realFetch(u, o)) as any;
document.body.innerHTML = '<div id="t"></div>';
createRoot(document.getElementById("t")!).render(<MemoryRouter initialEntries={["/doctors"]}><AppContainer showNavbar><DoctorList /></AppContainer></MemoryRouter>);
