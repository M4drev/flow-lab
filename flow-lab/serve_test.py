"""Testes da ponte local; nunca abrem um editor real nem alteram o sistema."""

import io
import json
import os
from pathlib import Path
import plistlib
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import serve


class EditorTests(unittest.TestCase):
    def test_editor_arguments_use_each_launcher_contract(self):
        examples = {
            "zed": ["/main.ts:5"],
            "code": ["--goto", "/main.ts:5"],
            "kwrite": ["--line", "5", "/main.ts"],
            "gedit": ["+5", "/main.ts"],
        }
        for name, arguments in examples.items():
            editor = serve.classify([name])
            self.assertEqual(serve.editor_arguments(editor, Path("/main.ts"), 5), [name, *arguments])
        unknown = serve.classify(["another-editor"])
        self.assertFalse(unknown["lineSupported"])
        self.assertEqual(serve.editor_arguments(unknown, Path("/main.ts"), 5), ["another-editor", "/main.ts"])

    def test_explicit_preference_is_not_a_fixed_zed_default(self):
        with patch.dict(os.environ, {"VISUAL": "code --reuse-window", "EDITOR": "zed"}), patch.object(serve.shutil, "which", return_value="/usr/bin/code"):
            automatic = serve.resolve_editor("auto")
            self.assertEqual(automatic["id"], "code")
            self.assertIn("--reuse-window", automatic["prefix"])
            self.assertEqual(serve.resolve_editor("zed")["id"], "zed")
        with patch.object(serve.shutil, "which", return_value=None):
            with self.assertRaisesRegex(ValueError, "PATH"):
                serve.resolve_editor("zed")

    def test_each_os_default_is_used_when_no_environment_preference(self):
        with patch.dict(os.environ, {"VISUAL": "", "EDITOR": ""}):
            for platform, resolver, command in [
                ("linux", "linux_default", "kwrite"),
                ("win32", "windows_default", "code"),
                ("darwin", "mac_default", "zed"),
            ]:
                expected = serve.classify([command])
                with patch.object(serve, resolver, return_value=expected) as mocked:
                    self.assertEqual(serve.resolve_editor(platform=platform), expected)
                    mocked.assert_called_once()

    def test_linux_reads_the_users_mime_association(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / "applications").mkdir()
            (root / "applications/user-editor.desktop").write_text(
                '[Desktop Entry]\nName=Meu editor\nExec="/usr/bin/kwrite" %U\n', encoding="utf-8",
            )
            with patch.dict(os.environ, {"XDG_DATA_HOME": folder}), patch.object(serve, "run_readonly", return_value="user-editor.desktop"):
                result = serve.linux_default()
            self.assertEqual(result["id"], "kwrite")
            self.assertEqual(result["prefix"], ["/usr/bin/kwrite"])
            self.assertEqual(result["label"], "Meu editor")

    def test_mac_uses_native_open_if_gui_has_no_cli(self):
        raw = plistlib.dumps({"LSHandlers": [{"LSHandlerContentType": "public.plain-text", "LSHandlerRoleAll": "dev.zed.Zed"}]})
        with patch.object(serve.subprocess, "run", return_value=SimpleNamespace(stdout=raw)), patch.object(serve.shutil, "which", return_value=None):
            editor = serve.mac_default()
        self.assertEqual(editor["prefix"], ["open", "-b", "dev.zed.Zed"])
        self.assertFalse(editor["lineSupported"])


class SourceTests(unittest.TestCase):
    def test_paths_and_line_numbers_stay_inside_codebase(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            source = root / "main.ts"
            source.write_text("one\ntwo\n", encoding="utf-8")
            (root / ".hidden.ts").write_text("private\n", encoding="utf-8")
            (root / "command.sh").write_text("command\n", encoding="utf-8")
            self.assertEqual(serve.checked_source(root, "main.ts", 2), source)
            for path, line in [("../main.ts", 1), ("missing.ts", 1), (".hidden.ts", 1), ("command.sh", 1), ("main.ts", 0), ("main.ts", True), ("main.ts", "1"), ("main.ts", 3)]:
                with self.subTest(path=path, line=line), self.assertRaises(ValueError):
                    serve.checked_source(root, path, line)
            with tempfile.TemporaryDirectory() as outside:
                external = Path(outside) / "outside.ts"
                external.write_text("outside\n", encoding="utf-8")
                try:
                    (root / "linked.ts").symlink_to(external)
                except OSError:
                    return  # Windows pode exigir permissão para criar links.
                with self.assertRaises(ValueError):
                    serve.checked_source(root, "linked.ts", 1)

    def handler(self, root, payload, *, token="test-token", origin="http://localhost:4173", host="localhost:4173"):
        body = json.dumps(payload).encode()
        handler = serve.LabHandler.__new__(serve.LabHandler)
        handler.server = SimpleNamespace(repo_root=root, editor_selection="auto", token="test-token", server_address=("127.0.0.1", 4173))
        handler.path = "/api/open-source"
        handler.headers = {"Host": host, "Origin": origin, "X-Flow-Lab-Token": token, "Content-Type": "application/json", "Content-Length": str(len(body))}
        handler.rfile = io.BytesIO(body)
        handler.responses = []
        handler.respond_json = lambda status, response: handler.responses.append((status, response))
        return handler

    def test_route_launches_only_valid_source_with_argument_array(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            (root / "source with spaces.ts").write_text("one\ntwo\n", encoding="utf-8")
            payload = {"path": "source with spaces.ts", "line": 2, "editor": "zed"}
            with patch.object(serve, "resolve_editor", return_value=serve.classify(["zed"])), patch.object(serve.subprocess, "Popen") as launch:
                handler = self.handler(root, payload)
                handler.do_POST()
                self.assertEqual(handler.responses[0][0], 200)
                self.assertEqual(launch.call_args.args[0], ["zed", str(root / "source with spaces.ts") + ":2"])
                self.assertNotIn("shell", launch.call_args.kwargs)
                for options in [{"token": "wrong"}, {"origin": "https://external.invalid"}, {"host": "external.invalid:4173"}]:
                    invalid = self.handler(root, payload, **options)
                    invalid.do_POST()
                    self.assertEqual(invalid.responses[0][0], 403)
                invalid = self.handler(root, {"path": "../outside.ts", "line": 2})
                invalid.do_POST()
                self.assertEqual(invalid.responses[0][0], 400)
                invalid = self.handler(root, ["invalid-json-object"])
                invalid.do_POST()
                self.assertEqual(invalid.responses[0][0], 400)
                self.assertEqual(launch.call_count, 1)


if __name__ == "__main__":
    unittest.main()
