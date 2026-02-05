export const tooltipBtn = ({
  html,
  text,
  position = "top"
}) => {
  const positionClass =
    position === "top"
      ? "bottom-full mb-2"
      : "top-full mt-2";

  return `
    <div class="relative group inline-flex">
      ${html}
      <span class="absolute ${positionClass} left-1/2 -translate-x-1/2
        px-2 py-1 text-xs text-white bg-gray-800 rounded
        opacity-0 group-hover:opacity-100 transition-opacity
        whitespace-nowrap pointer-events-none z-50">
        ${text}
      </span>
    </div>
  `;
};
