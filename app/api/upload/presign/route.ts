import { NextRequest, NextResponse } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { r2 } from "@/lib/r2"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const { fileName, mimeType, fileSize } = await req.json()
  const allowedTypes = [
    "audio/mpeg",
    "audio/mp4",
    "audio/wav",
    "audio/webm",
    "video/mp4",
    "video/quicktime",
    "video/webm",
  ]
  if (!allowedTypes.includes(mimeType)) {
    return NextResponse.json(
      { error: "File type not allowed" },
      { status: 400 }
    )
  }
  if (fileSize > 2 * 1024 * 1024 * 1024) {
    // 2GB
    return NextResponse.json({ error: "File too large" }, { status: 400 })
  }

  const ext = fileName.split(".").pop()
  const key = `lectures/${Date.now()}-${crypto.randomUUID()}.${ext}`

  const presignedUrl = await getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: mimeType,
    }),
    { expiresIn: 3600 }
  )

  const { data: upload, error } = await supabase
    .from("uploads")
    .insert({
      filename: fileName,
      mime_type: mimeType,
      file_path: key,
      status: "uploading",
    })
    .select()
    .single()

  if (error) {
    console.error("Supabase insert error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    uploadId: upload.id,
    presignedUrl,
    key,
  })
}
