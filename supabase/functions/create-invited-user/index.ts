// Supabase Edge Function for secure invite-only user registration
// Uses service role key to create users - keeps admin credentials out of the app

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

// Validate invite code format (8 alphanumeric chars, uppercase)
function isValidCodeFormat(code: string): boolean {
  return typeof code === "string" && /^[A-Z0-9]{8}$/.test(code);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    // Verify Supabase environment is configured
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return errorResponse("Server configuration error", 500);
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Parse request body
    let email: string;
    let password: string;
    let displayName: string;
    let inviteCode: string;

    try {
      const body = await req.json();
      email = body.email?.trim();
      password = body.password;
      displayName = body.displayName?.trim();
      inviteCode = body.inviteCode?.toUpperCase().trim();
    } catch {
      return errorResponse("Invalid JSON in request body");
    }

    // Validate required fields
    if (!email || typeof email !== "string") {
      return errorResponse("Email is required");
    }
    if (!password || typeof password !== "string") {
      return errorResponse("Password is required");
    }
    if (!displayName || typeof displayName !== "string") {
      return errorResponse("Display name is required");
    }
    if (!inviteCode || !isValidCodeFormat(inviteCode)) {
      return errorResponse("Invalid invite code format");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Invalid email format");
    }

    // Validate password length
    if (password.length < 6) {
      return errorResponse("Password must be at least 6 characters");
    }

    // Step 1: Validate invite code
    const { data: inviteValidation, error: validateError } = await supabaseAdmin
      .rpc("validate_invite_code", { invite_code: inviteCode });

    if (validateError) {
      console.error("Invite validation error:", validateError);
      return errorResponse("Failed to validate invite code", 500);
    }

    const validationResult = inviteValidation?.[0];
    if (!validationResult?.valid) {
      return errorResponse(validationResult?.error_message || "Invalid invite code");
    }

    // Step 2: Create user with admin API
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for invited users
      user_metadata: {
        display_name: displayName,
      },
    });

    if (createError) {
      console.error("User creation error:", createError);
      // Handle common errors with user-friendly messages
      if (createError.message.includes("already been registered")) {
        return errorResponse("An account with this email already exists");
      }
      return errorResponse(createError.message);
    }

    if (!authData.user) {
      return errorResponse("Failed to create user account", 500);
    }

    // Step 3: Consume invite and create friendship (atomic operation)
    const { error: consumeError } = await supabaseAdmin.rpc("consume_invite_and_befriend", {
      invite_code: inviteCode,
      new_user_id: authData.user.id,
    });

    if (consumeError) {
      console.error("Invite consumption error:", consumeError);
      // Critical: Invite consumption failed after user was created
      // Delete the user to maintain consistency
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return errorResponse("This invite code is no longer valid. Please request a new invite.");
    }

    // Success! Return user info (client will need to sign in)
    return jsonResponse({
      success: true,
      message: "Account created successfully. Please sign in.",
      userId: authData.user.id,
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return errorResponse("An unexpected error occurred", 500);
  }
});
