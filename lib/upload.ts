export type UploadResult = {
  uploadId: string
  key: string
}

export async function uploadLectureFile(
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  // 1. Get presigned URL from your server
  const presignRes = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    }),
  })

  if (!presignRes.ok) {
    const { error } = await presignRes.json()
    throw new Error(error ?? "Failed to get upload URL")
  }

  const { uploadId, presignedUrl, key } = await presignRes.json()

  // 2. Upload directly to R2 using XMLHttpRequest (gives us progress)
  await uploadToR2(presignedUrl, file, onProgress)

  // 3. Tell your server the upload is done
  await fetch("/api/upload/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId }),
  })

  return { uploadId, key }
}

function uploadToR2(
  url: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`R2 upload failed: ${xhr.status}`))
    })

    xhr.addEventListener("error", () =>
      reject(new Error("Network error during upload"))
    )

    xhr.open("PUT", url)
    xhr.setRequestHeader("Content-Type", file.type)
    xhr.send(file)
  })
}
