'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBrand } from '@/hooks/use-brands';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Creatives', segment: 'creatives' },
  { label: 'Design System', segment: 'design-system' },
  { label: 'Variants', segment: 'variants' },
];

export default function BrandDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const { data: brand, isLoading } = useBrand(params.id);
  const pathname = usePathname();

  return (
    <div>
      {/* Brand header */}
      <div className="mb-6">
        {isLoading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <h1 className="text-2xl font-bold tracking-tight">{brand?.name ?? 'Brand'}</h1>
        )}
      </div>

      {/* Tab navigation */}
      <div className="mb-6">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          {tabs.map((tab) => {
            const href = `/brands/${params.id}/${tab.segment}`;
            const isActive = pathname.includes(`/${tab.segment}`);
            return (
              <Link
                key={tab.segment}
                href={href}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'hover:bg-background/50'
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {children}
    </div>
  );
}
