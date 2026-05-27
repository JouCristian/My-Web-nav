# -*- coding: utf-8 -*-
from __future__ import annotations

import contextlib
import html
import importlib.util
import io
import json
import shutil
import tempfile
import traceback
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import quote


PROJECT_ROOT = Path(__file__).resolve().parents[1]
GENERATOR_PATH = PROJECT_ROOT / "tools" / "csp_word_generator_v13.py"
PDF_PAGE_WIDTH = 595.28


def _json(handler: BaseHTTPRequestHandler, status: int, payload: dict):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def _load_generator():
    spec = importlib.util.spec_from_file_location("csp_word_generator_v13", GENERATOR_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("无法加载 CSP 文档生成脚本。")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _find_generated_file(work_dir: Path, suffix: str):
    files = sorted(work_dir.glob(f"*.{suffix}"), key=lambda item: item.stat().st_mtime, reverse=True)
    return files[0] if files else None


def _pdf_styles():
    from reportlab.lib.colors import HexColor
    from reportlab.lib.enums import TA_CENTER
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.cidfonts import UnicodeCIDFont

    try:
        pdfmetrics.registerFont(UnicodeCIDFont("STSong-Light"))
    except Exception:
        pass

    base = getSampleStyleSheet()
    base.add(
        ParagraphStyle(
            name="JouTitle",
            parent=base["Title"],
            fontName="STSong-Light",
            fontSize=22,
            leading=30,
            textColor=HexColor("#1F4E79"),
            alignment=TA_CENTER,
            spaceAfter=10,
        )
    )
    base.add(
        ParagraphStyle(
            name="JouSubtitle",
            parent=base["BodyText"],
            fontName="STSong-Light",
            fontSize=10,
            leading=16,
            textColor=HexColor("#6B7280"),
            alignment=TA_CENTER,
            spaceAfter=18,
        )
    )
    base.add(
        ParagraphStyle(
            name="JouHeading",
            parent=base["Heading2"],
            fontName="STSong-Light",
            fontSize=15,
            leading=22,
            textColor=HexColor("#1F4E79"),
            spaceBefore=12,
            spaceAfter=7,
        )
    )
    base.add(
        ParagraphStyle(
            name="JouBody",
            parent=base["BodyText"],
            fontName="STSong-Light",
            fontSize=10.5,
            leading=18,
            textColor=HexColor("#1F2937"),
            spaceAfter=7,
        )
    )
    base.add(
        ParagraphStyle(
            name="JouCode",
            parent=base["Code"],
            fontName="Courier",
            fontSize=8.5,
            leading=11,
            textColor=HexColor("#111827"),
            backColor=HexColor("#F3F4F6"),
            borderColor=HexColor("#E5E7EB"),
            borderWidth=0.5,
            borderPadding=6,
            leftIndent=2,
            rightIndent=2,
            spaceBefore=4,
            spaceAfter=8,
        )
    )
    return base


def _cn_num(number: int):
    nums = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"]
    if number <= 10:
        return "十" if number == 10 else nums[number]
    if number < 20:
        return "十" + nums[number - 10]
    tens, ones = divmod(number, 10)
    return nums[tens] + "十" + (nums[ones] if ones else "")


def _paragraph(text: str, style):
    from reportlab.platypus import Paragraph

    return Paragraph(html.escape(text).replace("\n", "<br/>"), style)


def _add_markdown_table(story, block: str, styles):
    from reportlab.lib import colors
    from reportlab.platypus import Table, TableStyle

    rows = []
    for line in block.splitlines():
        stripped = line.strip()
        if not stripped.startswith("|") or set(stripped.replace("|", "").strip()) <= {"-", ":"}:
            continue
        rows.append([cell.strip() for cell in stripped.strip("|").split("|")])

    if not rows:
        return False

    table = Table(rows, hAlign="LEFT", repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "STSong-Light"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                ("LEADING", (0, 0), (-1, -1), 12),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#D9EAF7")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#1F4E79")),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D1D5DB")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(table)
    return True


def _add_section_content(story, content: str, styles):
    from reportlab.platypus import Preformatted, Spacer

    parts = content.split("```")
    for index, part in enumerate(parts):
        text = part.strip()
        if not text:
            continue

        if index % 2 == 1:
            lines = text.splitlines()
            if lines and lines[0].strip().lower() in {"cpp", "c++", "text", "python", "py"}:
                text = "\n".join(lines[1:]).strip()
            story.append(Preformatted(text, styles["JouCode"], maxLineLength=95))
            story.append(Spacer(1, 5))
            continue

        blocks = []
        current = []
        for line in text.splitlines():
            if line.strip().startswith("|"):
                current.append(line)
            else:
                if current:
                    blocks.append(("table", "\n".join(current)))
                    current = []
                if line.strip():
                    blocks.append(("text", line.strip()))
        if current:
            blocks.append(("table", "\n".join(current)))

        paragraph_buffer = []
        for kind, value in blocks:
            if kind == "table":
                if paragraph_buffer:
                    story.append(_paragraph(" ".join(paragraph_buffer), styles["JouBody"]))
                    paragraph_buffer = []
                _add_markdown_table(story, value, styles)
                story.append(Spacer(1, 7))
                continue

            if value.startswith("[[图:") or value.startswith("[[/图]]"):
                if paragraph_buffer:
                    story.append(_paragraph(" ".join(paragraph_buffer), styles["JouBody"]))
                    paragraph_buffer = []
                story.append(_paragraph(value, styles["JouBody"]))
            elif value.startswith(("•", "-", "*")):
                if paragraph_buffer:
                    story.append(_paragraph(" ".join(paragraph_buffer), styles["JouBody"]))
                    paragraph_buffer = []
                story.append(_paragraph(value, styles["JouBody"]))
            else:
                paragraph_buffer.append(value)

        if paragraph_buffer:
            story.append(_paragraph(" ".join(paragraph_buffer), styles["JouBody"]))


def _build_fallback_pdf(input_text: str, filename: str):
    from reportlab.lib.colors import HexColor
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Spacer

    generator = _load_generator()
    sections = generator.parse_sections(input_text)
    title = sections.get("标题", "CSP真题：未命名——完整题解复盘（C++）")
    subtitle = sections.get("副标题", "")
    styles = _pdf_styles()
    output = io.BytesIO()

    def draw_page(canvas, document):
        canvas.saveState()
        canvas.setStrokeColor(HexColor("#D9EAF7"))
        canvas.setLineWidth(0.6)
        canvas.line(2 * cm, 1.7 * cm, PDF_PAGE_WIDTH - 2 * cm, 1.7 * cm)
        canvas.setFillColor(HexColor("#6B7280"))
        canvas.setFont("STSong-Light", 8)
        canvas.drawString(2 * cm, 1.15 * cm, "JouJou 开源工具库 · CSP 题解复盘")
        canvas.drawRightString(PDF_PAGE_WIDTH - 2 * cm, 1.15 * cm, f"第 {document.page} 页")
        canvas.restoreState()

    doc = SimpleDocTemplate(
        output,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2.2 * cm,
        title=title,
        author="JouJou 开源工具库",
    )

    story = [_paragraph(title, styles["JouTitle"])]
    if subtitle:
        story.append(_paragraph(subtitle, styles["JouSubtitle"]))
    story.append(Spacer(1, 4))

    ordered = [
        "题目背景",
        "完整题目要求",
        "输入格式",
        "输出格式",
        "输入输出样例",
        "子任务与限制条件",
        "题目提示与关键区别",
        "我的完整思考流程复盘",
        "原始代码",
        "AC代码",
        "错误分析",
        "优化过程",
        "可进一步优化的小细节",
        "复杂度分析",
        "题解关键词",
        "总结",
    ]

    section_index = 1
    for section_name in ordered:
        if section_name == "输入输出样例":
            sample_parts = []
            for number in ("1", "2"):
                for label in ("输入", "输出", "解释"):
                    content = sections.get(f"样例{number}{label}", "").strip()
                    if content:
                        sample_parts.append(f"样例 {number} {label}\n{content}")
            content = "\n\n".join(sample_parts)
        else:
            content = sections.get(section_name, "").strip()

        if not content:
            continue

        story.append(_paragraph(f"{_cn_num(section_index)}、{section_name}", styles["JouHeading"]))
        _add_section_content(story, content, styles)
        section_index += 1

    doc.build(story, onFirstPage=draw_page, onLaterPages=draw_page)
    return filename, output.getvalue()


def _build_document(input_text: str, export_format: str):
    with tempfile.TemporaryDirectory(prefix="joujou-csp-") as temp_dir:
        work_dir = Path(temp_dir)
        input_path = work_dir / "input.txt"
        input_path.write_text(input_text, encoding="utf-8")

        generator = _load_generator()
        stdout = io.StringIO()

        with contextlib.redirect_stdout(stdout):
            generator.build(input_path)

        file_path = _find_generated_file(work_dir, export_format)
        if file_path is None:
            output = stdout.getvalue().strip()
            if export_format == "pdf":
                docx_path = _find_generated_file(work_dir, "docx")
                fallback_name = docx_path.with_suffix(".pdf").name if docx_path else "CSP-完整题解复盘.pdf"
                return _build_fallback_pdf(input_text, fallback_name)
            raise RuntimeError(f"没有找到生成的 {export_format} 文件。\n\n脚本输出：\n{output}")

        return file_path.name, file_path.read_bytes()


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length") or "0")
            raw_body = self.rfile.read(content_length).decode("utf-8")
            body = json.loads(raw_body or "{}")

            input_text = str(body.get("input") or "").strip()
            export_format = "pdf" if body.get("format") == "pdf" else "docx"

            if not input_text:
                _json(self, 400, {"error": "请输入需要生成文档的内容。"})
                return

            filename, file_bytes = _build_document(input_text, export_format)
            content_type = (
                "application/pdf"
                if export_format == "pdf"
                else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )

            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Disposition", f"attachment; filename*=UTF-8''{quote(filename)}")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(file_bytes)))
            self.end_headers()
            self.wfile.write(file_bytes)
        except Exception as error:
            message = str(error)
            if message.startswith("PDF_CONVERTER_UNAVAILABLE"):
                _json(
                    self,
                    501,
                    {
                        "code": "PDF_CONVERTER_UNAVAILABLE",
                        "error": "PDF 生成失败：当前 Preview 环境缺少 Word/LibreOffice 转换器，请先导出 Word 文档。",
                        "details": message,
                    },
                )
                return

            _json(
                self,
                500,
                {
                    "error": "文档生成失败，请检查输入内容或服务器 Python 环境。",
                    "details": f"{message}\n{traceback.format_exc()}",
                },
            )

    def do_GET(self):
        soffice = shutil.which("soffice") or shutil.which("libreoffice")
        _json(
            self,
            200,
            {
                "ok": True,
                "generator": GENERATOR_PATH.exists(),
                "pdfConverter": bool(soffice),
            },
        )
