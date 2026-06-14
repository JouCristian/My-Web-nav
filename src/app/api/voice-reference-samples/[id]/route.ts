import { NextRequest, NextResponse } from "next/server"
import {
  assertVoiceReferenceSampleAdmin,
  deleteVoiceReferenceSample,
  updateVoiceReferenceSample,
  VoiceReferenceSampleHttpError,
} from "@/lib/ai-voice-workshop/reference-samples-server"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await assertVoiceReferenceSampleAdmin()
    const { id } = await context.params
    return NextResponse.json(await updateVoiceReferenceSample(id, await request.json()))
  } catch (error) {
    return referenceSampleErrorResponse(error, "更新精选参考音频失败")
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await assertVoiceReferenceSampleAdmin()
    const { id } = await context.params
    return NextResponse.json(await deleteVoiceReferenceSample(id))
  } catch (error) {
    return referenceSampleErrorResponse(error, "删除精选参考音频失败")
  }
}

function referenceSampleErrorResponse(error: unknown, fallback: string) {
  console.error(`[voice-reference-samples] ${fallback}`, error)
  if (error instanceof VoiceReferenceSampleHttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  return NextResponse.json({ error: error instanceof Error ? error.message : fallback }, { status: 500 })
}
