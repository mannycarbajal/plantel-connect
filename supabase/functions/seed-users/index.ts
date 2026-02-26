import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserSeed {
  email: string;
  password: string;
  role: "revisor" | "enlace" | "direccion" | "comite";
}

const USERS: UserSeed[] = [
  { email: "fernando.barreto@fundacionazteca.org", password: "B@rreto2025!", role: "revisor" },
  { email: "ruben.carbajal@fundacionazteca.org", password: "C@rbajal2025!", role: "enlace" },
  { email: "claudia.cruz@fundacionazteca.org", password: "Cruz@2025!", role: "enlace" },
  { email: "maria.lopez@fundacionazteca.org", password: "Lopez@2025!", role: "enlace" },
  { email: "juan.sanchez@fundacionazteca.org", password: "S@nchez2025!", role: "direccion" },
  { email: "coral.perez@fundacionazteca.org", password: "Perez@2025!", role: "comite" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results = [];

    for (const u of USERS) {
      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
      });

      if (authError) {
        // User might already exist
        if (authError.message?.includes("already been registered")) {
          results.push({ email: u.email, status: "already_exists" });
          continue;
        }
        results.push({ email: u.email, status: "error", error: authError.message });
        continue;
      }

      // Assign role
      const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
        user_id: authData.user.id,
        role: u.role,
      });

      results.push({
        email: u.email,
        status: roleError ? "created_no_role" : "created",
        role: u.role,
        error: roleError?.message,
      });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
