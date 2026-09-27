
  import { createRoot } from "react-dom/client";
  import App from "./app/App";
  import "./styles/index.css";
  import "@neshan-maps-platform/ol/ol.css";

  createRoot(document.getElementById("root")!).render(<App />);
  