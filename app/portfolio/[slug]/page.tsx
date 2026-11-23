import { notFound } from "next/navigation";
export default async function PublicPortfolio({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // The client-side studio publishes a shareable local preview. Connect Supabase and apply the SQL schema
  // to make published profiles available across devices and visitors.
  if (!slug) notFound();
  return <main className="public-shell"><a className="brand" href="/">Folio<span>Nexa</span></a><h1>Portfolio link</h1><p>This public route is ready for database-backed publishing. Configure Supabase and use the included schema to serve published profiles.</p><a href="/">Open FolioNexa Studio ↗</a></main>;
}