// main.jsx
// -----------------------------------------------------------
// Idhu namma app oda entry point.
// BrowserRouter na App component ah wrap pannurom,
// adhu than namakku ulla ella <Link> and <Route> um
// work aaga help pannum. (Step 2)
// -----------------------------------------------------------

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
