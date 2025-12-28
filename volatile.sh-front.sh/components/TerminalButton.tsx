import React from "react";

interface TerminalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger";
  isLoading?: boolean;
}

export const TerminalButton: React.FC<TerminalButtonProps> = ({
  children,
  variant = "primary",
  isLoading,
  className = "",
  ...props
}) => {
  const baseStyles =
    "relative px-6 py-3 font-bold uppercase tracking-wider text-sm transition-all duration-100 ease-in-out border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black";

  const variants = {
    primary:
      "border-term-green text-term-bg bg-term-green hover:bg-term-green-dim hover:border-term-green-dim focus:ring-term-green",
    danger:
      "border-red-500 text-red-500 bg-transparent hover:bg-red-900/20 focus:ring-red-500 hover:text-red-400 hover:border-red-400",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${isLoading ? "opacity-50 cursor-wait" : ""} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? "> EXECUTING..." : children}
    </button>
  );
};
