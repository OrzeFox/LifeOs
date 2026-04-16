interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-xl p-5 ${className}`}>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}
