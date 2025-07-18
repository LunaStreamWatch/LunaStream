import { useEffect } from "react";

const CustomCursor: React.FC = () => {
  useEffect(() => {
    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    document.body.appendChild(cursor);

    const MAX_WIDTH = 300;  // max width threshold to morph
    const MAX_HEIGHT = 400;  // max height threshold to morph

    const moveCursor = (e: MouseEvent) => {
      cursor.style.top = `${e.clientY}px`;
      cursor.style.left = `${e.clientX}px`;

      const element = document.elementFromPoint(e.clientX, e.clientY);

      let width = 32;
      let height = 32;
      let borderRadius = "12px";  // default rounded corners
      let isInteractive = false;

      const interactiveEl = element?.closest(
        "a, button, input, textarea, select, label, [role='button'], [onclick], [tabindex]:not([tabindex='-1'])"
      );

      if (interactiveEl) {
        const rect = interactiveEl.getBoundingClientRect();

        // Only morph if below max size threshold
        if (rect.width <= MAX_WIDTH && rect.height <= MAX_HEIGHT) {
          isInteractive = true;
          width = rect.width;
          height = rect.height;

          const style = window.getComputedStyle(interactiveEl);
          const computedBorderRadius = style.borderRadius;

          // Use the computed borderRadius if valid, else fallback
          if (computedBorderRadius && computedBorderRadius !== "0px") {
            borderRadius = computedBorderRadius;
          } else {
            borderRadius = "12px";
          }
        }
      }

      cursor.style.width = `${width}px`;
      cursor.style.height = `${height}px`;
      cursor.style.borderRadius = borderRadius;

      if (isInteractive) {
        cursor.classList.add("clickable");
        cursor.style.background = "rgba(219, 39, 119, 0.3)";
        cursor.style.boxShadow = "0 0 16px 8px rgba(219, 39, 119, 0.3)";
      } else {
        cursor.classList.remove("clickable");
        cursor.style.width = "32px";
        cursor.style.height = "32px";
        cursor.style.borderRadius = "12px";
        cursor.style.background = "rgba(147, 51, 234, 0.3)";
        cursor.style.boxShadow = "0 0 16px 8px rgba(147, 51, 234, 0.3)";
      }
    };

    document.addEventListener("mousemove", moveCursor);

    return () => {
      document.removeEventListener("mousemove", moveCursor);
      cursor.remove();
    };
  }, []);

  return null;
};

export default CustomCursor;
