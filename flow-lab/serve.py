"""Servidor local do laboratório e ponte para o editor escolhido nesta máquina."""

import argparse
import configparser
import json
import os
from pathlib import Path
import plistlib
import secrets
import shlex
import shutil
import subprocess
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

VIEWER = Path(__file__).resolve().parent
EDITORS = {
    "zed": ("Zed", ["zed", "zeditor"], "location"),
    "code": ("VS Code", ["code", "code-insiders"], "goto"),
    "codium": ("VSCodium", ["codium"], "goto"),
    "cursor": ("Cursor", ["cursor"], "goto"),
    "antigravity": ("Antigravity", ["antigravity"], "goto"),
    "kate": ("Kate", ["kate"], "line"),
    "kwrite": ("KWrite", ["kwrite"], "line"),
    "subl": ("Sublime Text", ["subl", "sublime_text"], "location"),
    "gedit": ("Gedit", ["gedit"], "plus"),
    "idea": ("IntelliJ IDEA", ["idea"], "line"),
    "webstorm": ("WebStorm", ["webstorm"], "line"),
}
SOURCE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".java", ".py", ".html", ".css", ".scss", ".md", ".json", ".yaml", ".yml", ".txt", ".sql", ".rs", ".go", ".kt", ".swift"}


def run_readonly(command):
    try:
        return subprocess.run(command, capture_output=True, text=True, timeout=4, check=False).stdout.strip()
    except (OSError, subprocess.TimeoutExpired):
        return ""


def classify(prefix, label=None):
    executable = Path(prefix[0]).name.lower().removesuffix(".exe")
    for key, (name, commands, style) in EDITORS.items():
        if executable in commands:
            return {"id": key, "label": label or name, "prefix": prefix, "style": style, "lineSupported": True}
    return {"id": "system", "label": label or executable, "prefix": prefix, "style": "file", "lineSupported": False}


def linux_default():
    desktop_id = run_readonly(["xdg-mime", "query", "default", "text/plain"])
    if not desktop_id or Path(desktop_id).name != desktop_id:
        return None
    roots = [Path(os.environ.get("XDG_DATA_HOME", str(Path.home() / ".local/share")))]
    roots += [Path(part) for part in os.environ.get("XDG_DATA_DIRS", "/usr/local/share:/usr/share").split(":") if part]
    for root in roots:
        entry = root / "applications" / desktop_id
        if not entry.is_file():
            continue
        parser = configparser.ConfigParser(interpolation=None)
        parser.read(entry, encoding="utf-8")
        args = shlex.split(parser.get("Desktop Entry", "Exec", fallback=""))
        args = [arg for arg in args if not arg.startswith("%") and "%%" not in arg]
        if args:
            return classify(args, parser.get("Desktop Entry", "Name", fallback=desktop_id))
    return None


def windows_default():
    import winreg
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.txt\UserChoice") as key:
            prog_id = winreg.QueryValueEx(key, "ProgId")[0]
    except OSError:
        try:
            with winreg.OpenKey(winreg.HKEY_CLASSES_ROOT, ".txt") as key:
                prog_id = winreg.QueryValueEx(key, "")[0]
        except OSError:
            return None
    try:
        with winreg.OpenKey(winreg.HKEY_CLASSES_ROOT, prog_id + r"\shell\open\command") as key:
            command = winreg.QueryValueEx(key, "")[0]
        args = [part.strip('"') for part in shlex.split(command, posix=False) if "%" not in part]
        return classify(args) if args else None
    except OSError:
        return None


def mac_default():
    try:
        raw = subprocess.run(["defaults", "export", "com.apple.LaunchServices/com.apple.launchservices.secure", "-"], capture_output=True, timeout=4, check=False).stdout
    except (OSError, subprocess.TimeoutExpired):
        return None
    try:
        handlers = plistlib.loads(raw).get("LSHandlers", [])
    except (plistlib.InvalidFileException, ValueError):
        return None
    bundles = {"dev.zed.Zed": "zed", "com.microsoft.VSCode": "code", "com.vscodium": "codium", "com.todesktop.230313mzl4w4u92": "cursor", "com.sublimetext.4": "subl"}
    for handler in reversed(handlers):
        if handler.get("LSHandlerContentType") in {"public.plain-text", "public.text"}:
            bundle = handler.get("LSHandlerRoleAll", "")
            key = bundles.get(bundle)
            if key:
                try:
                    return named_editor(key)
                except ValueError:
                    pass  # A aplicação pode existir sem um launcher CLI no PATH.
            if bundle:
                return {"id": "system", "label": bundle, "prefix": ["open", "-b", bundle], "style": "file", "lineSupported": False}
    return None


def named_editor(key):
    if key not in EDITORS:
        raise ValueError("Editor não reconhecido. Selecione um dos editores disponíveis.")
    label, commands, style = EDITORS[key]
    for command in commands:
        executable = shutil.which(command)
        if executable:
            return {"id": key, "label": label, "prefix": [executable], "style": style, "lineSupported": True}
    raise ValueError(label + " não está disponível no PATH. Instale/habilite o comando CLI do editor.")


def resolve_editor(selection="auto", platform=None):
    if selection != "auto":
        return named_editor(selection)
    # Uma preferência explícita do usuário no ambiente precede a associação de texto.
    preference = os.environ.get("VISUAL") or os.environ.get("EDITOR")
    if preference:
        prefix = shlex.split(preference)
        if prefix and shutil.which(prefix[0]):
            candidate = classify(prefix)
            if candidate["lineSupported"]:
                return candidate
    platform = platform or sys.platform
    if platform == "win32":
        candidate = windows_default()
    elif platform == "darwin":
        candidate = mac_default()
    else:
        candidate = linux_default()
    if candidate:
        return candidate
    return {"id": "system", "label": "Editor padrão do sistema", "prefix": [], "style": "system", "lineSupported": False}


def editor_arguments(editor, file_path, line):
    prefix = editor["prefix"]
    if editor["style"] == "goto":
        return prefix + ["--goto", str(file_path) + ":" + str(line)]
    if editor["style"] == "location":
        return prefix + [str(file_path) + ":" + str(line)]
    if editor["style"] == "line":
        return prefix + ["--line", str(line), str(file_path)]
    if editor["style"] == "plus":
        return prefix + ["+" + str(line), str(file_path)]
    return prefix + [str(file_path)]


def checked_source(repo_root, raw_path, line):
    if not isinstance(raw_path, str) or not raw_path or not isinstance(line, int) or isinstance(line, bool) or line < 1:
        raise ValueError("Arquivo e linha inválidos.")
    target = (repo_root / raw_path).resolve()
    if not target.is_relative_to(repo_root) or not target.is_file() or target.suffix.lower() not in SOURCE_EXTENSIONS or any(part.startswith(".") for part in target.relative_to(repo_root).parts):
        raise ValueError("Escolha um arquivo de código dentro do repositório.")
    with target.open(encoding="utf-8") as source:
        count = sum(1 for _ in source)
    if line > count:
        raise ValueError("A linha não existe no arquivo atual.")
    return target


class LabServer(ThreadingHTTPServer):
    def __init__(self, address, repo_root, editor):
        self.repo_root = repo_root.resolve()
        self.editor_selection = editor
        self.token = secrets.token_urlsafe(32)
        super().__init__(address, LabHandler)


class LabHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(VIEWER), **kwargs)

    def local_request(self):
        host = self.headers.get("Host", "")
        port = self.server.server_address[1]
        return host in {f"127.0.0.1:{port}", f"localhost:{port}"}

    def respond_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if not self.local_request():
            return self.respond_json(403, {"error": "Acesso somente pelo endereço local do laboratório."})
        if urlparse(self.path).path != "/api/editor":
            return super().do_GET()
        try:
            selected = resolve_editor("auto")
            available = [{"id": key, "label": value[0]} for key, value in EDITORS.items() if any(shutil.which(command) for command in value[1])]
            self.respond_json(200, {"editor": selected["label"], "defaultId": self.server.editor_selection, "lineSupported": selected["lineSupported"], "available": available, "token": self.server.token})
        except (OSError, ValueError) as error:
            self.respond_json(503, {"error": str(error)})

    def do_POST(self):
        if urlparse(self.path).path != "/api/open-source":
            return self.respond_json(404, {"error": "Ação inexistente."})
        origin = self.headers.get("Origin", "")
        if not self.local_request() or origin != "http://" + self.headers.get("Host", "") or not secrets.compare_digest(self.headers.get("X-Flow-Lab-Token", ""), self.server.token):
            return self.respond_json(403, {"error": "Abra o laboratório pelo seu servidor local."})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 8192 or self.headers.get("Content-Type", "").split(";")[0] != "application/json":
                raise ValueError("Envie arquivo e linha como JSON.")
            payload = json.loads(self.rfile.read(length))
            target = checked_source(self.server.repo_root, payload.get("path"), payload.get("line"))
            selected = resolve_editor(payload.get("editor", self.server.editor_selection))
            if selected["style"] == "system":
                if sys.platform == "win32":
                    os.startfile(str(target))
                else:
                    subprocess.Popen(["open" if sys.platform == "darwin" else "xdg-open", str(target)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                subprocess.Popen(editor_arguments(selected, target, payload["line"]), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            self.respond_json(200, {"editor": selected["label"], "lineSupported": selected["lineSupported"], "message": "Arquivo enviado ao editor." if selected["lineSupported"] else "Arquivo aberto; este editor não possui um adaptador de navegação por linha."})
        except (OSError, ValueError, TypeError, AttributeError) as error:
            self.respond_json(400, {"error": str(error)})


def main():
    parser = argparse.ArgumentParser(description="Flow Lab com abertura de arquivo/linha no editor local.")
    parser.add_argument("--port", type=int, default=4173)
    parser.add_argument("--editor", choices=["auto", *EDITORS], default="auto", help="Preferência desta execução; auto consulta ambiente e sistema.")
    parser.add_argument("--repo-root", type=Path, default=VIEWER.parent)
    args = parser.parse_args()
    try:
        with LabServer(("127.0.0.1", args.port), args.repo_root, args.editor) as server:
            print(f"Flow Lab: http://localhost:{args.port} — editor: {args.editor}", flush=True)
            server.serve_forever()
    except KeyboardInterrupt:
        pass
    except OSError as error:
        parser.exit(1, f"Não foi possível iniciar: {error}. Pare o servidor anterior com Ctrl+C ou escolha --port.\n")


if __name__ == "__main__":
    main()
