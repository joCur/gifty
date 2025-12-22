"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const displayName = formData.get("displayName") as string;
  const birthday = (formData.get("birthday") as string) || null;

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      birthday: birthday || null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/friends");
  return { success: true };
}
