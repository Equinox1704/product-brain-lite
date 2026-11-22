import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "lenis/dist/lenis.css";
import App from "./App";
import SmoothScroll from "./SmoothScroll";
import "./index.css";

const client = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={client}>
      <SmoothScroll>
        <App />
      </SmoothScroll>
    </QueryClientProvider>
  </StrictMode>
);