import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// This runs on the server only. It's the one place allowed to use the
// secret service role key, which is what lets us create a login for a
// staff member without them needing to check an email and confirm it.
export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Name, email, and a 6+ character password are required." },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin();

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skip the "confirm your email" step entirely
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: created.user.id,
      name,
      role: "Staff",
      status: "active",
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
