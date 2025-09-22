import React from "react";

interface LabelProps {
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({ children }) => (
  <h4 className="text-lg font-bold text-white mb-4">{children}</h4>
);
