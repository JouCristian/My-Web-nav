from __future__ import annotations

import os
import sys


def main() -> int:
    endpoint = os.getenv("HF_ENDPOINT", "").strip() or "https://huggingface.co"
    print(f"[JouJou Voice Engine] Preloading openbmb/VoxCPM2 from {endpoint}")

    try:
        from huggingface_hub import snapshot_download

        model_path = snapshot_download(repo_id="openbmb/VoxCPM2")
    except Exception as error:  # noqa: BLE001 - startup can retry the download later.
        print(f"[JouJou Voice Engine] Model preload failed: {error}", file=sys.stderr)
        return 1

    print(f"[JouJou Voice Engine] VoxCPM2 model cached at: {model_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

