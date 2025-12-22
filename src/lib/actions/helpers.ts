"use server";

import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type AuthenticatedClient = {
  supabase: SupabaseClient<Database>;
  user: User;
};

/**
 * Get an authenticated Supabase client or throw an error
 * Use this in server actions that require authentication
 */
export async function requireAuth(): Promise<AuthenticatedClient> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Not authenticated");
  }

  return { supabase, user };
}

/**
 * Wrapper for server actions that require authentication
 * Returns { error: string } if not authenticated, otherwise runs the action
 */
export async function withAuth<T>(
  action: (client: AuthenticatedClient) => Promise<T>
): Promise<T | { error: string }> {
  try {
    const client = await requireAuth();
    return await action(client);
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return { error: "Not authenticated" };
    }
    throw error;
  }
}
