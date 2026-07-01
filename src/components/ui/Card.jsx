"use client";

function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-[var(--border-color)] shadow-[0_1px_4px_rgba(0,0,0,0.06)] ${className}`}>
      {(title || subtitle || action) && (
        <Card.Header title={title} subtitle={subtitle} action={action} />
      )}
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
      <div className="min-w-0 flex-1">
        {title && <h3 className="m-0 text-base font-semibold text-[var(--primary-color)] truncate">{title}</h3>}
        {subtitle && <p className="m-0 mt-0.5 text-xs text-[var(--text-secondary)]">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0 ml-3">{action}</div>}
    </div>
  );
};

Card.Body = function CardBody({ children, className = "" }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = "" }) {
  return (
    <div className={`px-5 py-3 border-t border-[var(--border-color)] bg-gray-50/50 rounded-b-xl ${className}`}>
      {children}
    </div>
  );
};

export default Card;
