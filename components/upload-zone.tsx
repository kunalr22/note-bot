"use client"

import { useCallback, useState } from "react"
import { useDropzone, FileRejection } from "react-dropzone"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { uploadLectureFile } from "@/lib/upload"

const ACCEPTED_TYPES = {
  "audio/mpeg": [".mp3"],
  "audio/mp4": [".m4a"],
  "audio/wav": [".wav"],
  "audio/webm": [".webm"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type UploadState = "idle" | "uploading" | "done"

export function UploadZone() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    setError(null)
    if (rejected.length > 0) {
      setError("Only mp3, mp4, m4a, wav, and webm files are supported.")
      return
    }
    if (accepted[0]) {
      setFile(accepted[0])
      setUploadState("idle")
      setProgress(0)
    }
  }, [])

  async function handleUpload() {
    if (!file) return
    setError(null)
    setUploadState("uploading")
    setProgress(0)
    try {
      const { uploadId } = await uploadLectureFile(file, setProgress)
      setUploadState("done")
      router.push(`/uploads/${uploadId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed")
      setUploadState("idle")
    }
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    multiple: false,
    disabled: uploadState === "uploading" || uploadState === "done",
  })

  return (
    <div className="flex h-svh w-full flex-col items-center justify-center gap-8 px-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">NoteBot</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Upload a lecture recording and let AI do the note-taking.
        </p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative flex h-72 w-full max-w-lg cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 transition-colors duration-200 focus:outline-none",
          isDragReject
            ? "border-destructive bg-destructive/5"
            : isDragActive
              ? "border-emerald-500 bg-emerald-500/5"
              : file
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-border bg-muted/30 hover:border-muted-foreground/50 hover:bg-muted/50",
        )}
      >
        <input {...getInputProps()} />

        {file && uploadState === "uploading" ? (
          <div className="flex w-full flex-col items-center gap-3 px-4">
            <p className="text-sm font-medium text-foreground">{file.name}</p>
            <div className="w-full max-w-xs">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{progress}%</p>
          </div>
        ) : file && uploadState === "done" ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">Upload complete</p>
            <p className="text-xs text-muted-foreground">{file.name}</p>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <p className="mt-1 text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); setUploadState("idle") }}
              className="mt-2 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-200",
              isDragReject ? "bg-destructive/10" : isDragActive ? "bg-emerald-500/10" : "bg-muted",
            )}>
              {isDragReject ? (
                <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              )}
            </div>
            <div className={cn("text-center transition-opacity duration-200", isDragActive && "opacity-40")}>
              <p className="text-sm font-medium text-foreground">Drag & drop your file here</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                or{" "}
                <span className="text-foreground underline underline-offset-2">browse from your computer</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload button */}
      {file && uploadState === "idle" && (
        <button
          onClick={handleUpload}
          className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          Generate Notes
        </button>
      )}

      {/* Accepted formats */}
      {!file && (
        <p className="text-xs text-muted-foreground">
          Supported: mp3, mp4, m4a, wav, webm
        </p>
      )}

      {/* Error badge */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive shadow-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 transition-colors">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
