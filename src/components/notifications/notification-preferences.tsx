"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/actions/notifications";

const REMINDER_OPTIONS = [
  { value: 0, label: "Disabled" },
  { value: 1, label: "1 day before" },
  { value: 3, label: "3 days before" },
  { value: 7, label: "1 week before" },
  { value: 14, label: "2 weeks before" },
  { value: 30, label: "1 month before" },
];

export function NotificationPreferences() {
  const [birthdayDays, setBirthdayDays] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      const prefs = await getNotificationPreferences();
      if (prefs) {
        setBirthdayDays(prefs.birthday_reminder_days);
      }
      setLoading(false);
    };
    fetchPreferences();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateNotificationPreferences(birthdayDays);
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Notification preferences updated");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Configure how you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="birthday-days">Birthday Reminder</Label>
          <div className="flex flex-wrap gap-2">
            {REMINDER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={birthdayDays === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setBirthdayDays(option.value)}
                className="transition-all"
              >
                {option.label}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Get notified before your friends&apos; birthdays so you have time to
            check their wishlists
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
