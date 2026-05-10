"""Amsterdam Anne Frank Walk — pipeline progress monitor.

Live TUI that watches the in-flight subagents (transcript translation, media
gathering, fact-checking) plus the deploy pipeline. Same pattern as the
KP-Bench monitor.py — Rich Live, multi-line cells, polled file signals.

Run:
    python3 monitor.py             # live updating, ~2s refresh
    python3 monitor.py --once      # one shot, prints + exits
"""
from __future__ import annotations
import os as _os
try: _os.chdir("/tmp")
except OSError: pass

import json, os, re, sys, time, subprocess
from pathlib import Path
from datetime import timedelta

from rich.live import Live
from rich.table import Table
from rich.console import Console, Group
from rich.text import Text
from rich.panel import Panel

ROOT = Path("/mnt/g/My Drive/Zoe/Amsterdam Anne Frank Walk")
REACT = ROOT / "react-app"
INTRO = REACT / "src/data/intro.json"
STOPS = REACT / "src/data/stops.json"
CAPS = REACT / "public/captions"
DIST = Path("/tmp/awalk/dist")
TASK_DIR = Path("/tmp/claude-1000/-mnt-g-My-Drive-Zoe-Amsterdam-Anne-Frank-Walk/80457f55-a90b-4d08-ac12-431ee016c9c0/tasks")

# (label, description, agent_id, expected_check_fn_name)
SUBAGENTS = [
    ("Fact-check",   "Source content + 17 stops · 54 facts · 23 corrections", "a761194ecd3cee151", "stops_factcheck"),
    ("Slideshow media", "115 captioned images across 17 stops",                "a79047e8dd6924fa7", "stops_gallery"),
    ("Transcript clean", "EN cleanup + NL/DE/HE translation (4 langs)",        "ac0ccc9718b5d29f4", "intro_4lang"),
    ("FR/ES/RU/YI",    "+4 languages → 8 total",                                "a475086c4a714c8d3", "intro_8lang"),
    ("Final 6 + rationale", "+PL/RMO/LAD/ID/CS/UK + rationale fields → 14",     "ae4563b20a25820e6", "intro_14lang"),
]

EXPECTED_LANGS_8  = ["en", "nl", "de", "fr", "es", "ru", "he", "yi"]
EXPECTED_LANGS_14 = EXPECTED_LANGS_8 + ["pl", "cs", "uk", "lad", "rmo", "id"]


def fmt_time(secs):
    if secs is None: return "—"
    if secs < 60: return f"{int(secs)}s ago"
    if secs < 3600: return f"{int(secs/60)}m ago"
    return f"{int(secs/3600)}h{int((secs%3600)/60)}m ago"


def agent_status(agent_id):
    """Return (state, file_kb, age_secs). State: running / idle / done / no-file."""
    f = TASK_DIR / f"{agent_id}.output"
    if not f.exists():
        return "no-file", None, None
    try:
        real = f.resolve()
        st = real.stat()
        age = time.time() - st.st_mtime
        size_kb = st.st_size // 1024
        if age < 30:
            return "running", size_kb, age
        elif age < 300:
            return "idle?", size_kb, age
        else:
            return "done", size_kb, age
    except Exception:
        return "?", None, None


def load_intro():
    if not INTRO.exists(): return None
    try: return json.loads(INTRO.read_text())
    except Exception: return None


def load_stops():
    if not STOPS.exists(): return None
    try: return json.loads(STOPS.read_text())
    except Exception: return None


def vtt_count():
    if not CAPS.exists(): return 0
    return len(list(CAPS.glob("intro.*.vtt")))


def check_stops_factcheck():
    """Subagent #1 — wrote stops.json with N stops + facts + factcheck_report.md."""
    d = load_stops()
    if not d or "stops" not in d: return ("missing", "—")
    n_stops = len(d["stops"])
    n_facts = sum(len(s.get("facts", [])) for s in d["stops"])
    n_corr = sum(len(s.get("corrections", [])) for s in d["stops"])
    if n_stops < 17:
        return ("partial", f"{n_stops}/17 stops")
    return ("done", f"{n_stops} stops · {n_facts} facts · {n_corr} corr")


def check_stops_gallery():
    """Subagent #2 — populated media.gallery on each stop."""
    d = load_stops()
    if not d: return ("missing", "—")
    counts = [len(s.get("media", {}).get("gallery", [])) for s in d["stops"]]
    n_with = sum(1 for c in counts if c > 0)
    n_imgs = sum(counts)
    if n_imgs < 60:
        return ("partial", f"{n_imgs} imgs across {n_with} stops")
    return ("done", f"{n_imgs} captioned imgs · {n_with}/17 stops")


def check_intro_lang(target_set):
    """Generic transcript-language check."""
    d = load_intro()
    if not d: return ("missing", "intro.json not found", 0, 0)
    transcripts = d.get("transcripts", {})
    have = set(transcripts.keys())
    target = set(target_set)
    matched = have & target
    n_have = len(matched)
    n_target = len(target)
    n_seg = len(transcripts.get("en", {}).get("segments", [])) or 116
    char_total = sum(sum(len(s.get("text", "")) for s in t.get("segments", [])) for t in transcripts.values())
    rationale_count = sum(1 for t in transcripts.values() if t.get("rationale"))
    return (n_have, n_target, n_seg, char_total, rationale_count, sorted(have))


def check_intro_4lang():
    n, t, n_seg, chars, rat, langs = check_intro_lang(EXPECTED_LANGS_8[:4])
    if n < t: return ("partial", f"{n}/{t} langs · {n_seg} seg · {chars//1000}K chars")
    return ("done", f"{n}/{t} langs · {n_seg} seg · {chars//1000}K chars")


def check_intro_8lang():
    n, t, n_seg, chars, rat, langs = check_intro_lang(EXPECTED_LANGS_8)
    if n < t: return ("partial", f"{n}/{t} langs · {n_seg} seg · {chars//1000}K chars")
    return ("done", f"{n}/{t} langs · {n_seg} seg · {chars//1000}K chars")


def check_intro_14lang():
    n, t, n_seg, chars, rat, langs = check_intro_lang(EXPECTED_LANGS_14)
    n_vtt = vtt_count()
    have_str = ' '.join(langs)
    msg = f"{n}/{t} langs · {n_seg} seg · {n_vtt} VTT · rationale {rat}/{n}"
    if n < t:
        return ("partial", msg + f"\n  have: {have_str}")
    if rat < n:
        return ("partial", msg + f"\n  rationale missing on {n - rat} langs")
    return ("done", msg)


CHECK_FNS = {
    "stops_factcheck": check_stops_factcheck,
    "stops_gallery": check_stops_gallery,
    "intro_4lang": check_intro_4lang,
    "intro_8lang": check_intro_8lang,
    "intro_14lang": check_intro_14lang,
}


def render():
    """Build a single Rich frame."""
    # ── subagent rows ──
    t = Table(title="Amsterdam Walk · subagent + deploy progress", show_lines=False, expand=True)
    t.add_column("Phase",       style="bold gold1", width=22, no_wrap=False)
    t.add_column("What it does", width=42, no_wrap=False)
    t.add_column("Agent",        width=11, no_wrap=False)
    t.add_column("Progress",     width=44, no_wrap=False)
    t.add_column("Output",       justify="right", width=12)

    for label, desc, aid, fn_name in SUBAGENTS:
        fn = CHECK_FNS.get(fn_name)
        ag_state, ag_kb, ag_age = agent_status(aid)
        if fn:
            try: status, msg = fn()
            except Exception as e: status, msg = "err", str(e)[:40]
        else:
            status, msg = "?", "no check fn"

        # Choose status colour for the agent column
        if ag_state == "running":   ag_disp = Text("● running", style="bold cyan")
        elif ag_state == "idle?":   ag_disp = Text("◐ idle?", style="yellow")
        elif ag_state == "done":    ag_disp = Text("✓ done", style="green")
        elif ag_state == "no-file": ag_disp = Text("(none)", style="dim")
        else:                       ag_disp = Text(ag_state, style="dim")

        # Output column: file size + age
        out_disp = ""
        if ag_kb is not None:
            out_disp = f"{ag_kb} KB\n{fmt_time(ag_age)}"

        # Progress message colour by deliverable status
        prog_style = {
            "done": "green", "partial": "yellow", "missing": "dim",
            "err": "red", "?": "dim",
        }.get(status, "")
        prog_text = Text()
        prog_text.append("✓ " if status == "done" else ("• " if status == "partial" else "○ "), style=prog_style)
        prog_text.append(msg, style=prog_style)

        t.add_row(label, desc, ag_disp, prog_text, out_disp)

    # ── deploy / live state row ──
    t.add_section()
    intro = load_intro()
    n_lang_now = len(intro.get("transcripts", {})) if intro else 0
    n_seg_now = len(intro.get("transcripts", {}).get("en", {}).get("segments", [])) if intro else 0
    rat_now = sum(1 for v in (intro or {}).get("transcripts", {}).values() if v.get("rationale"))
    n_vtt_now = vtt_count()
    deploy_msg = (
        f"intro.json on disk: {n_lang_now}/14 langs · {n_seg_now} segments · "
        f"VTT files: {n_vtt_now}/14 · rationale: {rat_now}/{n_lang_now}"
    )
    t.add_row("Live deploy state", "What's currently in /react-app/ on disk",
              Text("(local)", style="dim"),
              Text(deploy_msg),
              "")

    # ── live URL probe (cheap; 1s timeout) ──
    try:
        import urllib.request
        req = urllib.request.Request(
            "https://amsterdam-walk.rubase.org/data/stops.json"
                if False else "https://amsterdam-walk.rubase.org/",
            method="HEAD"
        )
        # Actually probe the running React index (HEAD; 1.5s timeout)
        with urllib.request.urlopen(
            "https://amsterdam-walk.rubase.org/", timeout=1.5
        ) as r:
            live_status = f"HTTP {r.status}"
            live_style = "green"
    except Exception as e:
        live_status = f"unreachable ({type(e).__name__})"
        live_style = "red"
    t.add_row("Live site probe", "GET https://amsterdam-walk.rubase.org/",
              Text("net", style="dim"),
              Text(live_status, style=live_style),
              "")

    # ── footer ──
    now = time.strftime("%H:%M:%S")
    footer = Text.assemble(
        ("Amsterdam Anne Frank Walk · ", "dim"),
        (f"refreshed {now}", "bold"),
        ("  ·  Ctrl+C to exit", "dim"),
    )
    return Group(t, footer)


def main():
    once = "--once" in sys.argv
    console = Console()
    if once:
        console.print(render())
        return
    with Live(render(), console=console, refresh_per_second=0.5, screen=False) as live:
        try:
            while True:
                time.sleep(2)
                live.update(render())
        except KeyboardInterrupt:
            console.print("\n[dim]exited[/dim]")


if __name__ == "__main__":
    main()
