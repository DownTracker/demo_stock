// This client uses the SECRET service role key, which can bypass RLS and
// create user accounts directly. It must NEVER be imported into a
// component that runs in the browser — only inside files under app/api/
// (Route Handlers), which always run on the server.
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  // Create the admin client
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};
