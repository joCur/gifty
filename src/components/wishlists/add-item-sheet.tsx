"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchLinkMetadata, addItem } from "@/lib/actions/items";
import { toast } from "sonner";
import { Loader2, Link as LinkIcon, Sparkles, Package } from "lucide-react";

interface LinkMetadata {
  title: string;
  description: string | null;
  image_url: string | null;
  price: string | null;
  currency: string | null;
  url: string;
}

export function AddItemSheet({
  wishlistId,
  children,
}: {
  wishlistId: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);

  async function handleFetchMetadata() {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Auto-add https:// if scheme is missing
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
      setUrl(normalizedUrl);
    }

    // Basic URL validation
    try {
      new URL(normalizedUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsFetching(true);
    const result = await fetchLinkMetadata(normalizedUrl);

    if ("error" in result) {
      toast.error(result.error);
      setIsFetching(false);
      return;
    }

    setMetadata(result);
    setIsFetching(false);
  }

  async function handleAddItem(formData: FormData) {
    if (!metadata) return;

    setIsAdding(true);
    formData.set("url", metadata.url || url);
    formData.set("title", formData.get("title") as string || metadata.title);
    formData.set("description", metadata.description || "");
    formData.set("image_url", metadata.image_url || "");
    formData.set("price", metadata.price || "");
    formData.set("currency", metadata.currency || "");

    const result = await addItem(wishlistId, formData);

    if (result.error) {
      toast.error(result.error);
      setIsAdding(false);
      return;
    }

    toast.success("Item added to wishlist!");
    setOpen(false);
    setUrl("");
    setMetadata(null);
    setIsAdding(false);
  }

  function handleReset() {
    setUrl("");
    setMetadata(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="px-6">
          <DialogTitle className="font-[family-name:var(--font-outfit)]">
            Add Item
          </DialogTitle>
          <DialogDescription>
            Paste a link to automatically fetch product details.
          </DialogDescription>
        </DialogHeader>

        {!metadata ? (
          <div className="px-6 pb-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400/20 to-indigo-500/10 flex items-center justify-center">
                  <LinkIcon className="w-4 h-4 text-blue-500" />
                </div>
                <Label htmlFor="url" className="text-sm font-medium">
                  Product URL
                </Label>
              </div>
              <div className="flex gap-2">
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/product"
                  className="h-11 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
                  disabled={isFetching}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleFetchMetadata();
                    }
                  }}
                />
                <Button
                  onClick={handleFetchMetadata}
                  disabled={isFetching}
                  className="rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all"
                >
                  {isFetching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Fetch
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pl-1">
                We&apos;ll automatically extract the product name, image, and price.
              </p>
            </div>
          </div>
        ) : (
          <form action={handleAddItem} className="px-6 pb-6 space-y-5">
            {/* Preview card */}
            <div className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 shrink-0">
                {metadata.image_url ? (
                  <Image
                    src={metadata.image_url}
                    alt={metadata.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-2">{metadata.title}</p>
                {metadata.price && (
                  <p className="text-sm text-primary font-medium mt-1">
                    {metadata.currency} {metadata.price}
                  </p>
                )}
              </div>
            </div>

            {/* Title field */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                defaultValue={metadata.title}
                required
                disabled={isAdding}
                className="h-11 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
              />
            </div>

            {/* Notes field */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Personal Notes <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Size, color preference, etc."
                disabled={isAdding}
                className="h-11 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isAdding}
                className="rounded-xl"
              >
                Change URL
              </Button>
              <Button
                type="submit"
                disabled={isAdding}
                className="rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add to Wishlist"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
