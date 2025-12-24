"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateInviteCode } from "@/lib/actions/invites";
import { toast } from "sonner";
import { Loader2, Plus, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function GenerateInviteButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setIsLoading(true);
    const result = await generateInviteCode();
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.code) {
      setGeneratedCode(result.code);
      setShowDialog(true);
    }
  }

  function getInviteUrl(code: string) {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/signup?invite=${code}`;
  }

  async function copyToClipboard() {
    if (!generatedCode) return;

    try {
      await navigator.clipboard.writeText(getInviteUrl(generatedCode));
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }

  function handleClose() {
    setShowDialog(false);
    setGeneratedCode(null);
    setCopied(false);
  }

  return (
    <>
      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        className="rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Generate Invite
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-outfit)]">
              Invite Created!
            </DialogTitle>
            <DialogDescription>
              Share this link with a friend to invite them to Giftify. This invite expires in 7 days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Invite code display */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Invite Code</p>
              <p className="font-mono text-lg font-semibold">{generatedCode}</p>
            </div>

            {/* Invite URL */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Invite Link</p>
              <p className="text-sm font-mono break-all text-muted-foreground">
                {generatedCode && getInviteUrl(generatedCode)}
              </p>
            </div>

            {/* Copy button */}
            <Button
              onClick={copyToClipboard}
              className="w-full rounded-xl"
              variant={copied ? "secondary" : "default"}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Invite Link
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
