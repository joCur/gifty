"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchLinkMetadata, addItem } from "@/lib/actions/items";
import { toast } from "sonner";
import { Loader2, Link as LinkIcon, Sparkles } from "lucide-react";

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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] sm:h-auto">
        <SheetHeader>
          <SheetTitle>Add Item</SheetTitle>
          <SheetDescription>
            Paste a link to automatically fetch product details.
          </SheetDescription>
        </SheetHeader>

        {!metadata ? (
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Product URL</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/product"
                    className="pl-9"
                    disabled={isFetching}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleFetchMetadata();
                      }
                    }}
                  />
                </div>
                <Button onClick={handleFetchMetadata} disabled={isFetching}>
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
              <p className="text-xs text-muted-foreground">
                We&apos;ll automatically extract the product name, image, and price.
              </p>
            </div>
          </div>
        ) : (
          <form action={handleAddItem} className="py-6 space-y-4">
            <div className="flex gap-4">
              {metadata.image_url && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                  <Image
                    src={metadata.image_url}
                    alt={metadata.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              )}
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={metadata.title}
                    required
                    disabled={isAdding}
                  />
                </div>
                {metadata.price && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Price: </span>
                    {metadata.currency} {metadata.price}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Personal Notes (optional)</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Size, color preference, etc."
                disabled={isAdding}
              />
            </div>
            <SheetFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isAdding}
              >
                Change URL
              </Button>
              <Button type="submit" disabled={isAdding}>
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add to Wishlist"
                )}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
