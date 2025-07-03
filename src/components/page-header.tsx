import React from 'react';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {children}
    </div>
  );
}
