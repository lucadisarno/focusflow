import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/App";
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './index.css'  

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);