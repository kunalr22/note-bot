import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotesRenderer } from "@/components/notes-renderer"
import { Flashcards } from "@/components/flashcards"

export default async function UploadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: upload } = await supabase
    .from("uploads")
    .select("id, filename, status, notes, flashcards, transcript")
    .eq("id", id)
    .single()

  if (!upload) notFound()

  const isPending =
    upload.status === "uploading" ||
    upload.status === "pending" ||
    upload.status === "processing"

  if (isPending) {
    return (
      <div className="flex h-svh w-full flex-col items-center justify-center gap-4 px-4">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <svg className="h-5 w-5 animate-spin text-muted-foreground" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold">Processing your recording</h1>
          <p className="text-sm text-muted-foreground">
            This usually takes a minute or two. You can come back to this page anytime to check in.
          </p>
          <p className="text-xs text-muted-foreground">{upload.filename}</p>
        </div>
      </div>
    )
  }

  const flashcards: Flashcard[] = Array.isArray(upload.flashcards)
    ? upload.flashcards
    : []

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <Link href="/" className="flex w-fit items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:text-foreground">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        New upload
      </Link>
      <h1 className="text-xl font-semibold">{upload.filename}</h1>

      <Tabs defaultValue="notes" className="flex flex-col gap-6">
        <TabsList variant="line" className="w-fit gap-6 p-0">
          <TabsTrigger value="notes" className="px-0 text-sm data-active:text-foreground">Notes</TabsTrigger>
          <TabsTrigger value="flashcards" className="px-0 text-sm data-active:text-foreground">Flashcards</TabsTrigger>
          <TabsTrigger value="transcript" className="px-0 text-sm data-active:text-foreground">Transcript</TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <NotesRenderer content={upload.notes ?? ""} />
        </TabsContent>

        <TabsContent value="flashcards">
          <Flashcards cards={flashcards} />
        </TabsContent>

        <TabsContent value="transcript">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
            {upload.transcript}
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  )
}
