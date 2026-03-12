'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Palette, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/brands', label: 'Brands', icon: LayoutDashboard },
];

function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-4">
        <Link href="/brands" className="flex items-center gap-2 font-semibold">
          <Palette className="h-6 w-6" />
          <span>Brindin</span>
        </Link>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex md:flex-col md:w-64 border-r bg-background transition-all duration-300',
          !sidebarOpen && 'md:w-0 md:overflow-hidden'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet>
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <div className="flex-1" />
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>

        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </div>
  );
}
