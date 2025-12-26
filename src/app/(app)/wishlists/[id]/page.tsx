import { notFound } from "next/navigation";
import { getWishlist } from "@/lib/actions/wishlists";
import { getOwnershipFlags } from "@/lib/actions/ownership-flags";
import { WishlistPageContent } from "@/components/wishlists/wishlist-page-content";

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [wishlist, ownershipFlags] = await Promise.all([
    getWishlist(id),
    getOwnershipFlags(id),
  ]);

  if (!wishlist) {
    notFound();
  }

  return (
    <WishlistPageContent
      wishlist={wishlist}
      ownershipFlags={ownershipFlags}
    />
  );
}
