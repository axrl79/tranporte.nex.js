// components/Separator.tsx
import React from "react";
import clsx from "clsx";

type SeparatorProps = {
  orientation?: "horizontal" | "vertical";
  thickness?: string; // ej. "1px", "2px", "0.5rem"
  color?: string;     // ej. "border-gray-300", "bg-gray-200"
  className?: string;
  label?: string;
};

const Separator: React.FC<SeparatorProps> = ({
  orientation = "horizontal",
  thickness = "1px",
  color = "bg-gray-300",
  className = "",
  label,
}) => {
  if (label) {
    return (
      <div className={clsx("flex items-center gap-4", className)}>
        <div
          className={clsx(
            "flex-grow",
            color,
            orientation === "horizontal" ? "h-[1px]" : "w-[1px]"
          )}
          style={{
            height: orientation === "horizontal" ? thickness : undefined,
            width: orientation === "vertical" ? thickness : undefined,
          }}
        />
        <span className="text-gray-500 text-sm">{label}</span>
        <div
          className={clsx(
            "flex-grow",
            color,
            orientation === "horizontal" ? "h-[1px]" : "w-[1px]"
          )}
          style={{
            height: orientation === "horizontal" ? thickness : undefined,
            width: orientation === "vertical" ? thickness : undefined,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        orientation === "horizontal" ? "w-full" : "h-full",
        color,
        className
      )}
      style={{
        height: orientation === "horizontal" ? thickness : "100%",
        width: orientation === "vertical" ? thickness : "100%",
      }}
    />
  );
};

export default Separator;
