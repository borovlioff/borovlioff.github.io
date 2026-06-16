import { div } from "@borovlioff/no-jsx";
import { createSidebar } from "../../widgets/sidebar";
import { createContentPanel } from "../../widgets/content-panel";
import { createPreviewPanel } from "../../widgets/preview-panel";

export const createGeneratorPage = () => {
  return div(
    {
      className: "flex h-screen w-full overflow-hidden font-sans",
    },
    createSidebar(),
    createContentPanel(),
    createPreviewPanel(),
  );
};
