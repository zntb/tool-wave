export function Footer({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <footer
      className={`border-t border-slate-200 dark:border-slate-800 mt-16 ${className ?? ''}`}
      style={style}
    >
      <div className='container mx-auto px-4 py-8 max-w-7xl'>
        <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            © {new Date().getFullYear()} Tool Wave
          </p>
          <p className='text-sm text-slate-400 dark:text-slate-500'>
            Curated with ❤️ for the developer community
          </p>
        </div>
      </div>
    </footer>
  );
}
