import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const { uploadId } = await req.json()

  const { error } = await supabase
    .from("uploads")
    .update({ status: "pending" })
    .eq("id", uploadId)

  if (error) {
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
