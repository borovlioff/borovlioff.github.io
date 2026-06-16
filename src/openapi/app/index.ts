import { createGeneratorPage } from "../pages/generator";

export const initApp = () => {
  const root = document.getElementById("app");
  if (!root) {
    console.error("Root element #app not found");
    return;
  }
  root.appendChild(createGeneratorPage());
};

// Автозапуск при загрузке DOM
document.addEventListener("DOMContentLoaded", initApp);
