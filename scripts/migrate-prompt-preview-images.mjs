import { createClient } from "@supabase/supabase-js"
import pg from "pg"

const BUCKET = process.env.PROMPT_PREVIEW_BUCKET || "prompt-previews"
const APPLY = process.argv.includes("--apply")
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="))
const LIMIT = LIMIT_ARG ? Number.parseInt(LIMIT_ARG.split("=")[1] || "", 10) : 50

const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL or DIRECT_URL.")
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.")
}

if (!Number.isFinite(LIMIT) || LIMIT <= 0) {
  throw new Error("--limit must be a positive number.")
}

function parseDataUrl(value) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(value)
  if (!match) return null

  const [, mimeType, base64] = match
  const extension = mimeType.includes("png") ? "png" : mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "webp"

  return {
    bytes: Buffer.from(base64, "base64"),
    extension,
    mimeType,
  }
}

const pool = new pg.Pool({ connectionString: databaseUrl })
const supabase = createClient(supabaseUrl, supabaseKey)

try {
  const { rows } = await pool.query(
    `
      SELECT id, "previewImage"
      FROM "PromptCard"
      WHERE "previewImage" LIKE 'data:image/%'
      ORDER BY "updatedAt" DESC
      LIMIT $1
    `,
    [LIMIT],
  )

  console.log(`${APPLY ? "Applying" : "Dry run"} prompt preview migration for ${rows.length} card(s).`)

  for (const row of rows) {
    const parsed = parseDataUrl(row.previewImage)
    if (!parsed) {
      console.warn(`Skip ${row.id}: invalid data URL.`)
      continue
    }

    const path = `${row.id}-${Date.now()}.${parsed.extension}`

    if (!APPLY) {
      console.log(`[dry-run] ${row.id}: ${parsed.bytes.length} bytes -> ${BUCKET}/${path}`)
      continue
    }

    const { error } = await supabase.storage.from(BUCKET).upload(path, parsed.bytes, {
      cacheControl: "31536000",
      contentType: parsed.mimeType,
      upsert: true,
    })

    if (error) {
      console.error(`Upload failed for ${row.id}:`, error.message)
      continue
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path)

    await pool.query(
      `
        UPDATE "PromptCard"
        SET "previewImage" = $1,
            "previewImagePath" = $2,
            "updatedAt" = NOW()
        WHERE id = $3
      `,
      [publicUrl, path, row.id],
    )

    console.log(`Migrated ${row.id}: ${publicUrl}`)
  }

  if (!APPLY) {
    console.log("Dry run only. Re-run with --apply to upload files and update PromptCard rows.")
  }
} finally {
  await pool.end()
}
