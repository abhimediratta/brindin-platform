import { redirect } from 'next/navigation';

export default function BrandPage({ params }: { params: { id: string } }) {
  redirect(`/brands/${params.id}/creatives`);
}
