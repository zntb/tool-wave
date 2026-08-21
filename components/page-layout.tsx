import { BackgroundPattern } from '@/components/background-pattern';
import { Footer } from '@/components/footer';

interface PageLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  footerClassName?: string;
  footerStyle?: React.CSSProperties;
  className?: string;
  testId?: string;
}

export function PageLayout({
  children,
  showFooter = true,
  footerClassName,
  footerStyle,
  className,
  testId,
}: PageLayoutProps) {
  return (
    <div
      className={className || 'min-h-screen bg-slate-50 dark:bg-slate-950'}
      data-testid={testId}
    >
      <BackgroundPattern />

      <main className='container mx-auto px-4 py-8 md:py-12 lg:py-16 max-w-7xl'>
        {children}
      </main>

      {showFooter && (
        <Footer className={footerClassName} style={footerStyle} />
      )}
    </div>
  );
}
