import { NextRequest, NextResponse } from "next/server"
import {
  assertVoiceReferenceSampleAdmin,
  cleanupVoiceReferenceUploads,
  createVoiceReferenceUploadIntents,
  VoiceReferenceSampleHttpError,
  type VoiceReferenceUploadRequest,
} from "@/lib/ai-voice-workshop/reference-samples-server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    await assertVoiceReferenceSampleAdmin()
    const body = await request.json() as { sampleId?: string | null; files?: VoiceReferenceUploadRequest[] }
    return NextResponse.json(await createVoiceReferenceUploadIntents(body.sampleId ?? null, body.files ?? []))
  } catch (error) {
    return uploadIntentErrorResponse(error, "创建上传任务失败")
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await assertVoiceReferenceSampleAdmin()
    const body = await request.json() as { sampleId?: string; paths?: string[] }
    return NextResponse.json(await cleanupVoiceReferenceUploads(body.sampleId ?? "", body.paths ?? []))
  } catch (error) {
    return uploadIntentErrorResponse(error, "清理临时上传文件失败")
  }
}

function uploadIntentErrorResponse(error: unknown, fallback: string) {
  console.error(`[voice-reference-samples] ${fallback}`, error)
  if (error instanceof VoiceReferenceSampleHttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  return NextResponse.json({ error: error instanceof Error ? error.message : fallback }, { status: 500 })
}
