import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from("spreadsheets")
      .upload(`${userId}/${file.name}`, file);

    if (error) {
      console.error("Error uploading file:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create a record in the spreadsheets table
    const { data: spreadsheet, error: dbError } = await supabase
      .from("spreadsheets")
      .insert([
        {
          user_id: userId,
          name: file.name,
          storage_path: data.path,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Error saving spreadsheet record:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: spreadsheet });
  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 