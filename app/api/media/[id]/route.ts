import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if media file exists and user owns it
    const { data: mediaFile, error: fetchError } = await supabase
      .from("media")
      .select("id, user_id, filename")
      .eq("id", id)
      .single()

    if (fetchError || !mediaFile) {
      return NextResponse.json({ error: "Media file not found" }, { status: 404 })
    }

    if (mediaFile.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete file hash record first (due to foreign key constraint)
    await supabase.from("file_hashes").delete().eq("media_id", id)

    // Delete media record
    const { error: deleteError } = await supabase.from("media").delete().eq("id", id)

    if (deleteError) {
      console.error("Database error:", deleteError)
      return NextResponse.json({ error: "Failed to delete media file" }, { status: 500 })
    }

    // In a real application, you would also delete the actual file from storage here

    return NextResponse.json({ message: "Media file deleted successfully" })
  } catch (error) {
    console.error("Media delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
