# -*- coding: utf-8 -*-
from __future__ import annotations

import contextlib
import importlib.util
import io
import json
import tempfile
import traceback
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from typing import Optional
from urllib.parse import quote


PROJECT_ROOT = Path(__file__).resolve().parents[1]
GENERATOR_PATH = PROJECT_ROOT / "tools" / "csp_word_generator_v13.py"


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
        raise RuntimeError("无法加载算法题解文档生成脚本。")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _find_generated_file(work_dir: Path, suffix: str):
    files = sorted(work_dir.glob(f"*.{suffix}"), key=lambda item: item.stat().st_mtime, reverse=True)
    return files[0] if files else None


def _build_document(input_text: str, settings: Optional[dict] = None):
    with tempfile.TemporaryDirectory(prefix="joujou-csp-") as temp_dir:
        work_dir = Path(temp_dir)
        input_path = work_dir / "input.txt"
        input_path.write_text(input_text, encoding="utf-8")

        generator = _load_generator()
        stdout = io.StringIO()

        with contextlib.redirect_stdout(stdout):
            generator.build(input_path, settings)

        file_path = _find_generated_file(work_dir, "docx")
        if file_path is None:
            output = stdout.getvalue().strip()
            raise RuntimeError(f"没有找到生成的 Word 文件。\n\n脚本输出：\n{output}")

        return file_path.name, file_path.read_bytes()


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length") or "0")
            raw_body = self.rfile.read(content_length).decode("utf-8")
            body = json.loads(raw_body or "{}")

            input_text = str(body.get("input") or "").strip()
            export_format = str(body.get("format") or "docx")
            document_settings = body.get("documentSettings") if isinstance(body.get("documentSettings"), dict) else {}

            if not input_text:
                _json(self, 400, {"error": "请输入需要生成文档的内容。"})
                return

            if export_format != "docx":
                _json(self, 410, {"error": "网页端已停止生成 PDF，请先导出 Word，再在 Word/WPS 中使用 PDF 工具箱导出 PDF。"})
                return

            filename, file_bytes = _build_document(input_text, document_settings)
            content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Disposition", f"attachment; filename*=UTF-8''{quote(filename)}")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(file_bytes)))
            self.end_headers()
            self.wfile.write(file_bytes)
        except Exception as error:
            message = str(error)
            _json(
                self,
                500,
                {
                    "error": "文档生成失败，请检查输入内容或服务器 Python 环境。",
                    "details": f"{message}\n{traceback.format_exc()}",
                },
            )

    def do_GET(self):
        _json(
            self,
            200,
            {
                "ok": True,
                "generator": GENERATOR_PATH.exists(),
            },
        )
