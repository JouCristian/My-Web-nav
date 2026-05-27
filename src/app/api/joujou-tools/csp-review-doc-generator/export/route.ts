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

type ExportFormat = "docx" | "pdf"

function safeDownloadName(filename: string) {
  return encodeURIComponent(filename).replace(/[()]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
}

async function runGenerator(inputPath: string, cwd: string) {
  let lastError: unknown

  for (const command of pythonCandidates) {
    try {
      return await execFileAsync(command, [generatorPath, inputPath], {
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

async function findGeneratedFile(workDir: string, format: ExportFormat) {
  const files = await readdir(workDir)
  const target = files.find((file) => file.toLowerCase().endsWith(`.${format}`))
  return target ? path.join(workDir, target) : null
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

export async function POST(request: NextRequest) {
  const workDir = path.join(tmpdir(), `joujou-csp-${randomUUID()}`)

  try {
    const body = (await request.json()) as { input?: string; format?: ExportFormat }
    const input = body.input?.trim()
    const format = body.format === "pdf" ? "pdf" : "docx"

    if (!input) {
      return NextResponse.json({ error: "请输入需要生成文档的内容。" }, { status: 400 })
    }

    await mkdir(workDir, { recursive: true })
    const inputPath = path.join(workDir, "input.txt")
    await writeFile(inputPath, input, "utf8")

    const result = await runGenerator(inputPath, workDir)
    const filePath = await findGeneratedFile(workDir, format)

    if (!filePath) {
      const details = `${result.stdout || ""}\n${result.stderr || ""}`.trim()
      return NextResponse.json(
        {
          error:
            format === "pdf"
              ? "PDF 生成失败：当前服务器没有成功完成 Word 到 PDF 的转换。"
              : "Word 文档生成失败：没有找到脚本输出文件。",
          details,
        },
        { status: 500 },
      )
    }

    const file = await readFile(filePath)
    const filename = path.basename(filePath)
    const contentType =
      format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
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
