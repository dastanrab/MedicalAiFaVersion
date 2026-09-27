
  import { createRoot } from "react-dom/client";
  import App from "./app/App";
  import { initNativeShell } from "./app/native/initNativeShell";
  import "./styles/index.css";
  import "@neshan-maps-platform/ol/ol.css";

  createRoot(document.getElementById("root")!).render(<App />);

  // Hide the native splash once the web splash has painted, so the handoff is seamless.
  requestAnimationFrame(() => {
    void initNativeShell();
  });
  