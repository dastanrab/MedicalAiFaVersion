#!/usr/bin/env bash
# Repack debug APK assets without breaking native library compression.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE_APK="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
ASSETS_DIR="$ROOT/android/app/src/main/assets"
OUT_DIR="$ROOT/release"
OUT_APK="$OUT_DIR/medira-android-debug.apk"
ANDROID_SDK="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
JAVA_HOME="${JAVA_HOME:-/Users/alipixel/.jdks/temurin-21/Contents/Home}"
export JAVA_HOME
BT="$(ls -d "$ANDROID_SDK"/build-tools/* 2>/dev/null | sort -V | tail -1)"
KEYSTORE="${HOME}/.android/debug.keystore"
WORKDIR="$(mktemp -d)"

if [[ ! -x "$BT/apksigner" ]]; then
  echo "Missing apksigner under $ANDROID_SDK/build-tools" >&2
  exit 1
fi

if [[ ! -x "$JAVA_HOME/bin/java" ]]; then
  echo "Missing Java at JAVA_HOME=$JAVA_HOME (required for apksigner)" >&2
  exit 1
fi

cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

if [[ ! -f "$BASE_APK" ]]; then
  echo "Missing base APK: $BASE_APK" >&2
  echo "Build once in Android Studio or run: cd android && ./gradlew assembleDebug" >&2
  exit 1
fi

if [[ ! -f "$KEYSTORE" ]]; then
  echo "Missing debug keystore: $KEYSTORE" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
python3 - "$BASE_APK" "$ASSETS_DIR" "$WORKDIR/unsigned.apk" <<'PY'
import shutil
import sys
import zipfile
from pathlib import Path

base_apk, assets_dir, out_apk = map(Path, sys.argv[1:4])
assets_dir = assets_dir.resolve()

with zipfile.ZipFile(base_apk, "r") as src:
    infos = {info.filename: info for info in src.infolist()}

    with zipfile.ZipFile(out_apk, "w") as dst:
        for name, info in infos.items():
            data = src.read(name)
            if name.startswith("assets/"):
                continue
            if name.startswith("META-INF/"):
                continue
            new_info = zipfile.ZipInfo(name)
            new_info.compress_type = info.compress_type
            new_info.external_attr = info.external_attr
            new_info.date_time = info.date_time
            new_info.flag_bits = info.flag_bits
            new_info.create_system = info.create_system
            dst.writestr(new_info, data)

        def add_tree(relative_root: Path, zip_prefix: str) -> None:
            for path in sorted(relative_root.rglob("*")):
                if path.is_dir():
                    continue
                rel = path.relative_to(relative_root).as_posix()
                arc = f"{zip_prefix}/{rel}" if rel != "." else zip_prefix
                data = path.read_bytes()
                info = zipfile.ZipInfo(arc)
                info.compress_type = zipfile.ZIP_DEFLATED
                dst.writestr(info, data)

        add_tree(assets_dir / "public", "assets/public")
        for single in ("capacitor.config.json", "capacitor.plugins.json"):
            src_file = assets_dir / single
            if src_file.exists():
                data = src_file.read_bytes()
                info = zipfile.ZipInfo(f"assets/{single}")
                info.compress_type = zipfile.ZIP_DEFLATED
                dst.writestr(info, data)

print(f"Wrote unsigned APK: {out_apk}")
PY

ALIGNED="$WORKDIR/aligned.apk"
"$BT/zipalign" -f -p 4 "$WORKDIR/unsigned.apk" "$ALIGNED"
"$BT/apksigner" sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out "$OUT_APK" \
  "$ALIGNED"

"$BT/apksigner" verify --verbose "$OUT_APK" >/dev/null
ls -lh "$OUT_APK"
unzip -p "$OUT_APK" assets/capacitor.config.json | grep androidScheme
