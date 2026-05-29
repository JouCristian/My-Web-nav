import { execFile } from "node:child_process"
import { randomUUID } from "node:crypto"
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { promisify } from "node:util"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const execFileAsync = promisify(execFile)
const generatorPath = path.join(process.cwd(), "tools", "csp_word_generator_v13.py")
const pythonCandidates = process.platform === "win32" ? ["python", "py"] : ["python3", "python"]

function safeDownloadName(filename: string) {
  return encodeURIComponent(filename).replace(/[()]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
}

async function runGenerator(inputPath: string, cwd: string, settingsPath: string) {
  let lastError: unknown

  for (const command of pythonCandidates) {
    try {
      return await execFileAsync(command, [generatorPath, inputPath, settingsPath], {
        cwd,
        timeout: 120_000,
        windowsHide: true,
        maxBuffer: 1024 * 1024 * 8,
      })
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

async function findGeneratedFile(workDir: string) {
  const files = await readdir(workDir)
  const target = files.find((file) => file.toLowerCase().endsWith(".docx"))
  return target ? path.join(workDir, target) : null
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

export async function POST(request: NextRequest) {
  const workDir = path.join(tmpdir(), `joujou-csp-${randomUUID()}`)

  try {
    const body = (await request.json()) as { input?: string; format?: string; documentSettings?: unknown }
    const input = body.input?.trim()

    if (!input) {
      return NextResponse.json({ error: "请输入需要生成文档的内容。" }, { status: 400 })
    }

    if (body.format && body.format !== "docx") {
      return NextResponse.json(
        { error: "网页端已停止生成 PDF，请先导出 Word，再在 Word/WPS 中使用 PDF 工具箱导出 PDF。" },
        { status: 410 },
      )
    }

    await mkdir(workDir, { recursive: true })
    const inputPath = path.join(workDir, "input.txt")
    const settingsPath = path.join(workDir, "document-settings.json")
    await writeFile(inputPath, input, "utf8")
    await writeFile(settingsPath, JSON.stringify(body.documentSettings ?? {}), "utf8")

    const result = await runGenerator(inputPath, workDir, settingsPath)
    const filePath = await findGeneratedFile(workDir)

    if (!filePath) {
      const details = `${result.stdout || ""}\n${result.stderr || ""}`.trim()
      return NextResponse.json(
        {
          error: "Word 文档生成失败：没有找到脚本输出文件。",
          details,
        },
        { status: 500 },
      )
    }

    const file = await readFile(filePath)
    const filename = path.basename(filePath)

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${safeDownloadName(filename)}`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "文档生成失败，请检查输入内容或服务器 Python 环境。",
        details: errorMessage(error),
      },
      { status: 500 },
    )
  } finally {
    await rm(workDir, { recursive: true, force: true })
  }
}
