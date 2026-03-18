import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="field-group">
      {label && <label className="field-label" htmlFor={inputId}>{label}</label>}
      <input id={inputId} className={`input ${className ?? ''}`} {...props} />
    </div>
  );
}
