// Supabase Edge Function to fetch link metadata via LinkPreview.net API
// This keeps the API key secure on the server side

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LinkPreviewResponse {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName?: string;
}

interface MetadataResponse {
  title: string;
  description: string | null;
  image_url: string | null;
  price: string | null;
  currency: string | null;
  url: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify the user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client to verify token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the URL from request body
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch metadata from LinkPreview.net
    const apiKey = Deno.env.get("LINKPREVIEW_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "LinkPreview API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const linkPreviewResponse = await fetch("https://api.linkpreview.net", {
      method: "POST",
      headers: {
        "X-Linkpreview-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: url }),
    });

    if (!linkPreviewResponse.ok) {
      // Fallback: return basic metadata if API fails
      const metadata: MetadataResponse = {
        title: new URL(url).hostname,
        description: null,
        image_url: null,
        price: null,
        currency: null,
        url: url,
      };

      return new Response(JSON.stringify(metadata), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const linkData: LinkPreviewResponse = await linkPreviewResponse.json();

    // Extract price from description if present (basic pattern matching)
    let price: string | null = null;
    let currency: string | null = null;

    if (linkData.description) {
      // Common price patterns: $19.99, 19,99 EUR, EUR 19.99, etc.
      const pricePatterns = [
        /\$\s*(\d+[.,]?\d*)/,
        /(\d+[.,]?\d*)\s*(?:USD|EUR|GBP|CHF)/i,
        /(?:USD|EUR|GBP|CHF)\s*(\d+[.,]?\d*)/i,
        /(\d+[.,]\d{2})\s*€/,
        /€\s*(\d+[.,]\d{2})/,
      ];

      for (const pattern of pricePatterns) {
        const match = linkData.description.match(pattern);
        if (match) {
          price = match[1] || match[0];
          // Try to determine currency
          if (linkData.description.includes("$") || linkData.description.includes("USD")) {
            currency = "USD";
          } else if (linkData.description.includes("€") || linkData.description.includes("EUR")) {
            currency = "EUR";
          } else if (linkData.description.includes("£") || linkData.description.includes("GBP")) {
            currency = "GBP";
          } else if (linkData.description.includes("CHF")) {
            currency = "CHF";
          }
          break;
        }
      }
    }

    const metadata: MetadataResponse = {
      title: linkData.title || new URL(url).hostname,
      description: linkData.description || null,
      image_url: linkData.image || null,
      price,
      currency,
      url: linkData.url || url,
    };

    return new Response(JSON.stringify(metadata), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching link metadata:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch link metadata" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
