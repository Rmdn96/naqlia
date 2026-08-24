import { createClient } from "@supabase/supabase-js";

const staffRoles = new Set(["customer_service", "finance", "operations", "sales", "super_admin"]);

function getArgument(name) {
  const index = process.argv.indexOf(name);

  return index >= 0 ? process.argv[index + 1]?.trim() : undefined;
}

const email = getArgument("--email")?.toLowerCase();
const displayName = getArgument("--display-name");
const reason = getArgument("--reason");
const role = getArgument("--role");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

if (!supabaseUrl || !secretKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required");
}

if (!email || !displayName || !reason || !role || !staffRoles.has(role)) {
  throw new Error("Use --email, --display-name, --role, and --reason with an approved staff role");
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

let authUser;

for (let page = 1; page <= 100 && !authUser; page += 1) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });

  if (error) {
    throw error;
  }

  authUser = data.users.find((user) => user.email?.toLowerCase() === email);

  if (data.users.length < 1000) {
    break;
  }
}

if (!authUser) {
  throw new Error("No Supabase Auth user matches the supplied email address");
}

const { error } = await supabase.rpc("provision_staff_identity", {
  change_reason: reason,
  target_auth_user_id: authUser.id,
  target_display_name: displayName,
  target_role_key: role,
});

if (error) {
  throw error;
}

console.log(`Provisioned an authenticated staff identity with role: ${role}`);
