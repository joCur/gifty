"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  FileText,
  Link as LinkIcon,
  StickyNote,
  DollarSign,
} from "lucide-react";
import { ItemImageField } from "./item-image-field";

export interface ItemFormValues {
  url?: string | null;
  title: string;
  description?: string | null;
  image_url?: string | null;
  custom_image_url?: string | null;
  price?: string | null;
  currency?: string | null;
  notes?: string | null;
}

interface ItemFormFieldsProps {
  defaultValues?: Partial<ItemFormValues>;
  disabled?: boolean;
  showUrlField?: boolean;
  itemId?: string;
  wishlistId?: string;
}

export function ItemFormFields({
  defaultValues = {},
  disabled = false,
  showUrlField = false,
  itemId,
  wishlistId,
}: ItemFormFieldsProps) {
  return (
    <div className="space-y-5">
      {/* URL field - only shown in manual entry mode */}
      {showUrlField && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400/20 to-indigo-500/10 flex items-center justify-center">
              <LinkIcon className="w-4 h-4 text-blue-500" />
            </div>
            <Label htmlFor="url" className="text-sm font-medium">
              Product URL{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
          </div>
          <Input
            id="url"
            name="url"
            type="url"
            placeholder="https://example.com/product"
            defaultValue={defaultValues.url || ""}
            disabled={disabled}
            className="h-11 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
          />
        </div>
      )}

      {/* Title field */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-500/10 flex items-center justify-center">
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <Label htmlFor="title" className="text-sm font-medium">
            Title <span className="text-destructive">*</span>
          </Label>
        </div>
        <Input
          id="title"
          name="title"
          defaultValue={defaultValues.title || ""}
          required
          disabled={disabled}
          placeholder="What do you want?"
          className="h-11 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
        />
      </div>

      {/* Description field */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400/20 to-green-500/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <Label htmlFor="description" className="text-sm font-medium">
            Description{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
        </div>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultValues.description || ""}
          disabled={disabled}
          placeholder="Add any details about the item..."
          className="rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
        />
      </div>

      {/* Price and Currency fields */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400/20 to-purple-500/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-violet-600" />
          </div>
          <Label className="text-sm font-medium">
            Price{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
        </div>
        <div className="flex gap-2">
          <Input
            id="currency"
            name="currency"
            defaultValue={defaultValues.currency || ""}
            placeholder="$"
            disabled={disabled}
            className="h-11 w-20 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
          />
          <Input
            id="price"
            name="price"
            defaultValue={defaultValues.price || ""}
            placeholder="0.00"
            disabled={disabled}
            className="h-11 flex-1 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
          />
        </div>
      </div>

      {/* Image field with upload/URL toggle */}
      <ItemImageField
        defaultCustomImageUrl={defaultValues.custom_image_url}
        defaultImageUrl={defaultValues.image_url}
        itemId={itemId}
        wishlistId={wishlistId}
        disabled={disabled}
      />

      {/* Notes field */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400/20 to-cyan-500/10 flex items-center justify-center">
            <StickyNote className="w-4 h-4 text-sky-600" />
          </div>
          <Label htmlFor="notes" className="text-sm font-medium">
            Personal Notes{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
        </div>
        <Input
          id="notes"
          name="notes"
          defaultValue={defaultValues.notes || ""}
          disabled={disabled}
          placeholder="Size, color preference, etc."
          className="h-11 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
        />
      </div>
    </div>
  );
}
