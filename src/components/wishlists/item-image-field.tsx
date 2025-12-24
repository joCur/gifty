"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { removeItemImage } from "@/lib/actions/item-images";
import { STORAGE_CONFIG } from "@/lib/utils/storage";
import { toast } from "sonner";
import {
  ImageIcon,
  Upload,
  Link as LinkIcon,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ImageMode = "upload" | "url";

interface ItemImageFieldProps {
  defaultCustomImageUrl?: string | null;
  defaultImageUrl?: string | null;
  itemId?: string;
  wishlistId?: string;
  disabled?: boolean;
}

const ACCEPTED_TYPES = STORAGE_CONFIG.ALLOWED_TYPES.join(",");
const MAX_FILE_SIZE = STORAGE_CONFIG.MAX_FILE_SIZE;

export function ItemImageField({
  defaultCustomImageUrl,
  defaultImageUrl,
  itemId,
  wishlistId,
  disabled = false,
}: ItemImageFieldProps) {
  // Determine initial mode based on existing data
  const initialMode: ImageMode = defaultCustomImageUrl ? "upload" : "url";

  const [mode, setMode] = useState<ImageMode>(initialMode);
  const [isRemoving, setIsRemoving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(
    defaultCustomImageUrl || null
  );
  const [externalUrl, setExternalUrl] = useState(defaultImageUrl || "");
  // This ref is the actual form file input that gets submitted
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const resetFileState = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [preview]);

  const validateFile = (file: File): string | null => {
    const allowedTypes: readonly string[] = STORAGE_CONFIG.ALLOWED_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return "Please select a JPG, PNG, or WebP image";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Image must be less than 5MB";
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Revoke previous preview URL if exists
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    // Clear any existing uploaded URL since we're replacing with new file
    setUploadedImageUrl(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      // We need to set the file on the actual input for form submission
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
      handleFileSelect(file);
    }
  };

  const handleRemove = async () => {
    // If we have an existing uploaded image and this is an existing item, remove from storage
    if (uploadedImageUrl && itemId && wishlistId) {
      setIsRemoving(true);
      const result = await removeItemImage(itemId, wishlistId);

      if (result.error) {
        toast.error(result.error);
        setIsRemoving(false);
        return;
      }
      toast.success("Image removed");
      setIsRemoving(false);
    }

    // Clear local state
    setUploadedImageUrl(null);
    resetFileState();
  };

  const handleClearPreview = () => {
    // Just clear the preview and file input, don't remove from storage
    resetFileState();
  };

  const handleModeChange = (newMode: ImageMode) => {
    setMode(newMode);
    // Clear state when switching modes
    if (newMode === "url") {
      resetFileState();
      setUploadedImageUrl(null);
    } else {
      setExternalUrl("");
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setExternalUrl(url);
  };

  const isLoading = isRemoving;
  const hasUploadedImage = !!uploadedImageUrl;
  const hasPreview = !!preview;
  const showImage = hasUploadedImage || hasPreview;

  return (
    <div className="space-y-3">
      {/* Header with icon and label */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400/20 to-rose-500/10 flex items-center justify-center">
          <ImageIcon className="w-4 h-4 text-pink-600" />
        </div>
        <Label className="text-sm font-medium">
          Image{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => handleModeChange("upload")}
          disabled={disabled || isLoading}
          className="rounded-lg flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
        <Button
          type="button"
          variant={mode === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => handleModeChange("url")}
          disabled={disabled || isLoading}
          className="rounded-lg flex-1"
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          URL
        </Button>
      </div>

      {mode === "upload" ? (
        <div className="space-y-3">
          {/* Upload zone / Preview */}
          <div
            onClick={() => !disabled && !isLoading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border/50 hover:border-primary/50 hover:bg-muted/30",
              (disabled || isLoading) && "cursor-not-allowed opacity-50"
            )}
          >
            {showImage ? (
              <div className="relative">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted">
                  {hasPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : hasUploadedImage ? (
                    <Image
                      src={uploadedImageUrl}
                      alt="Item image"
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : null}
                </div>
                {!isLoading && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasPreview) {
                        // Just clearing a preview (new file not yet saved)
                        handleClearPreview();
                      } else if (hasUploadedImage) {
                        // Removing an existing uploaded image
                        handleRemove();
                      }
                    }}
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Drop an image here, or click to select
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, or WebP. Max 5MB.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* File input - named for form submission */}
          <input
            ref={fileInputRef}
            type="file"
            name="image_file"
            accept={ACCEPTED_TYPES}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled || isLoading}
          />

          {/* Info text when there's a preview */}
          {hasPreview && (
            <p className="text-xs text-muted-foreground text-center">
              Image will be uploaded when you save
            </p>
          )}

          {/* Remove button for existing uploaded images (not just preview) */}
          {hasUploadedImage && !hasPreview && itemId && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemove}
              disabled={isLoading}
              className="w-full rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Image
                </>
              )}
            </Button>
          )}
        </div>
      ) : (
        /* URL input mode */
        <Input
          name="image_url"
          type="url"
          value={externalUrl}
          onChange={handleUrlChange}
          disabled={disabled}
          placeholder="https://example.com/image.jpg"
          className="h-11 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
        />
      )}

      {/* Hidden inputs for form submission */}
      <input type="hidden" name="image_mode" value={mode} />
      <input type="hidden" name="custom_image_url" value={uploadedImageUrl || ""} />
    </div>
  );
}
