"use server";

import { createClient } from "./server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signUp(formData: FormData, inviteCode: string) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("displayName") as string;

  // Call edge function for secure user creation
  // The edge function uses service role key to create users,
  // keeping admin credentials out of the app
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: "Server configuration error" };
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/create-invited-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        displayName,
        inviteCode,
      }),
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      return { error: result.error || "Failed to create account" };
    }

    // Account created successfully - redirect to login
    // User needs to sign in since we used admin API (no auto-session)
    revalidatePath("/", "layout");
    redirect("/login?registered=true");
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Failed to connect to registration service" };
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Include email from auth.users for Gravatar support
  return profile ? { ...profile, email: user.email } : null;
}
