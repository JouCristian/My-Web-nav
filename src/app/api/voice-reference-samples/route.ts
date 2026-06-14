import { NextRequest, NextResponse } from "next/server"
import {
  assertVoiceReferenceSampleAdmin,
  createVoiceReferenceSample,
  listAllVoiceReferenceSamples,
  listPublicVoiceReferenceSamples,
  VoiceReferenceSampleHttpError,
} from "@/lib/ai-voice-workshop/reference-samples-server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const adminScope = request.nextUrl.searchParams.get("admin") === "1"
    if (adminScope) {
      await assertVoiceReferenceSampleAdmin()
      return NextResponse.json(await listAllVoiceReferenceSamples())
    }
    return NextResponse.json(await listPublicVoiceReferenceSamples())
  } catch (error) {
    return referenceSampleErrorResponse(error, "精选参考音频加载失败")
  }
}

export async function POST(request: NextRequest) {
  try {
    const email = await assertVoiceReferenceSampleAdmin()
    const sample = await createVoiceReferenceSample(await request.formData(), email)
    return NextResponse.json(sample, { status: 201 })
  } catch (error) {
    return referenceSampleErrorResponse(error, "新增精选参考音频失败")
  }
}

function referenceSampleErrorResponse(error: unknown, fallback: string) {
  console.error(`[voice-reference-samples] ${fallback}`, error)
  if (error instanceof VoiceReferenceSampleHttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  return NextResponse.json({ error: error instanceof Error ? error.message : fallback }, { status: 500 })
}

