import React from 'react';

export const Input = ({ value, onChange, className, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    className={className}
    placeholder={placeholder}
  />
);
