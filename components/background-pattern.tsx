export function BackgroundPattern() {
  return (
    <div
      className='fixed inset-0 -z-10 opacity-30 dark:opacity-10'
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }}
    />
  );
}
