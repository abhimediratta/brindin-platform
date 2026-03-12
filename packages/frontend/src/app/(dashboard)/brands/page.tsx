'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { useBrands, useCreateBrand } from '@/hooks/use-brands';
import { toast } from 'sonner';

export default function BrandsPage() {
  const { data: brands, isLoading, error } = useBrands();
  const createBrand = useCreateBrand();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createBrand.mutateAsync({ name: name.trim(), description: description.trim() || undefined });
      toast.success('Brand created successfully');
      setDialogOpen(false);
      setName('');
      setDescription('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create brand');
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title="Brands" />
        <p className="text-destructive">Failed to load brands. Make sure the backend is running.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Brands"
        description="Manage your brand portfolios and design systems"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Brand
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Brand</DialogTitle>
                <DialogDescription>
                  Add a new brand to start managing its creative assets and design system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Brand Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Acme Corp"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of the brand"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!name.trim() || createBrand.isPending}>
                  {createBrand.isPending ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : brands && brands.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand: any) => (
            <Link key={brand.id} href={`/brands/${brand.id}`}>
              <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{brand.name}</CardTitle>
                    {brand.categoryVertical && (
                      <Badge variant="secondary">{brand.categoryVertical}</Badge>
                    )}
                  </div>
                  {brand.description && (
                    <CardDescription>{brand.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>Created {new Date(brand.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No brands yet"
          description="Create your first brand to start managing creative assets and extracting design systems."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Brand
            </Button>
          }
        />
      )}
    </div>
  );
}
