'use client';

import React from 'react';

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  error?: string;
}

export function FormInput({ label, error, ...rest }: FormInputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        className={`w-full border rounded px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
