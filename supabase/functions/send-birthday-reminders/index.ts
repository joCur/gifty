// Supabase Edge Function to send birthday reminder notifications
// This should be run daily via a cron job

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Profile {
  id: string;
  display_name: string | null;
  birthday: string | null;
}

interface Friendship {
  requester_id: string;
  addressee_id: string;
  requester: Profile;
  addressee: Profile;
}

interface NotificationPreference {
  user_id: string;
  birthday_reminder_days: number;
}

serve(async (req) => {
  try {
    // Create Supabase client with service role key for elevated permissions
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get today's date in UTC
    const today = new Date();
    const todayMonth = today.getUTCMonth() + 1; // 0-indexed
    const todayDay = today.getUTCDate();

    // Get all users with notification preferences
    const { data: preferences, error: prefsError } = await supabase
      .from("notification_preferences")
      .select("user_id, birthday_reminder_days")
      .gt("birthday_reminder_days", 0);

    if (prefsError) {
      throw new Error(`Failed to fetch preferences: ${prefsError.message}`);
    }

    if (!preferences || preferences.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users with birthday notifications enabled" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    let notificationsCreated = 0;

    // Process each user's preferences
    for (const pref of preferences as NotificationPreference[]) {
      // Calculate the target birthday date (days from now)
      const targetDate = new Date(today);
      targetDate.setUTCDate(targetDate.getUTCDate() + pref.birthday_reminder_days);
      const targetMonth = targetDate.getUTCMonth() + 1;
      const targetDay = targetDate.getUTCDate();

      // Get user's friends
      const { data: friendships, error: friendsError } = await supabase
        .from("friendships")
        .select(`
          requester_id,
          addressee_id,
          requester:profiles!friendships_requester_id_fkey(id, display_name, birthday),
          addressee:profiles!friendships_addressee_id_fkey(id, display_name, birthday)
        `)
        .eq("status", "accepted")
        .or(`requester_id.eq.${pref.user_id},addressee_id.eq.${pref.user_id}`);

      if (friendsError) {
        console.error(`Error fetching friends for user ${pref.user_id}:`, friendsError);
        continue;
      }

      if (!friendships) continue;

      // Check each friend's birthday
      for (const friendship of friendships as unknown as Friendship[]) {
        const friend =
          friendship.requester_id === pref.user_id
            ? friendship.addressee
            : friendship.requester;

        if (!friend.birthday) continue;

        // Parse birthday (YYYY-MM-DD format)
        const [, birthdayMonthStr, birthdayDayStr] = friend.birthday.split("-");
        const birthdayMonth = parseInt(birthdayMonthStr, 10);
        const birthdayDay = parseInt(birthdayDayStr, 10);

        // Check if birthday matches target date
        if (birthdayMonth === targetMonth && birthdayDay === targetDay) {
          // Check if we already sent a notification for this birthday this year
          const startOfYear = new Date(today.getUTCFullYear(), 0, 1).toISOString();

          const { data: existingNotif } = await supabase
            .from("notifications")
            .select("id")
            .eq("user_id", pref.user_id)
            .eq("type", "birthday_reminder")
            .eq("actor_id", friend.id)
            .gte("created_at", startOfYear)
            .single();

          if (existingNotif) {
            // Already notified for this friend's birthday this year
            continue;
          }

          // Create the notification
          const message =
            pref.birthday_reminder_days === 0
              ? `Today is ${friend.display_name || "A friend"}'s birthday!`
              : pref.birthday_reminder_days === 1
                ? `${friend.display_name || "A friend"}'s birthday is tomorrow!`
                : `${friend.display_name || "A friend"}'s birthday is in ${pref.birthday_reminder_days} days`;

          const { error: insertError } = await supabase
            .from("notifications")
            .insert({
              user_id: pref.user_id,
              type: "birthday_reminder",
              title: "Birthday Reminder",
              message,
              actor_id: friend.id,
            });

          if (insertError) {
            console.error(`Error creating notification for user ${pref.user_id}:`, insertError);
          } else {
            notificationsCreated++;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notificationsCreated,
        message: `Created ${notificationsCreated} birthday reminder notifications`,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-birthday-reminders:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
