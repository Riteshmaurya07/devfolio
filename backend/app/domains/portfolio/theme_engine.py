from typing import Dict, Any

THEMES: Dict[str, Dict[str, str]] = {
    "minimal": {
        "--bg-primary": "#ffffff",
        "--bg-card": "#f8fafc",
        "--text-primary": "#0f172a",
        "--text-secondary": "#475569",
        "--accent-color": "#2563eb",
        "--border-color": "#e2e8f0",
        "--glass-backdrop": "none"
    },
    "modern": {
        "--bg-primary": "#0f172a",
        "--bg-card": "#1e293b",
        "--text-primary": "#f8fafc",
        "--text-secondary": "#94a3b8",
        "--accent-color": "#6366f1",
        "--border-color": "#334155",
        "--glass-backdrop": "none"
    },
    "glass": {
        "--bg-primary": "#030712",
        "--bg-card": "rgba(17, 24, 39, 0.7)",
        "--text-primary": "#f9fafb",
        "--text-secondary": "#9ca3af",
        "--accent-color": "#38bdf8",
        "--border-color": "rgba(255, 255, 255, 0.1)",
        "--glass-backdrop": "blur(16px)"
    },
    "dark": {
        "--bg-primary": "#000000",
        "--bg-card": "#111111",
        "--text-primary": "#ffffff",
        "--text-secondary": "#888888",
        "--accent-color": "#3b82f6",
        "--border-color": "#222222",
        "--glass-backdrop": "none"
    },
    "gradient": {
        "--bg-primary": "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
        "--bg-card": "#1e293b",
        "--text-primary": "#ffffff",
        "--text-secondary": "#cbd5e1",
        "--accent-color": "#a855f7",
        "--border-color": "#334155",
        "--glass-backdrop": "none"
    },
    "neon": {
        "--bg-primary": "#050505",
        "--bg-card": "#0a0a0f",
        "--text-primary": "#00ffcc",
        "--text-secondary": "#7000ff",
        "--accent-color": "#ff007f",
        "--border-color": "#ff007f",
        "--glass-backdrop": "none"
    }
}

RESERVED_SLUGS = {"api", "admin", "u", "p", "edit", "builder", "login", "register", "dashboard", "settings", "health"}

def resolve_theme_tokens(theme_name: str, primary_color: str | None = None, font_family: str | None = None) -> Dict[str, str]:
    tokens = THEMES.get(theme_name.lower(), THEMES["modern"]).copy()
    if primary_color:
        tokens["--accent-color"] = primary_color
    if font_family:
        tokens["--font-family"] = font_family
    return tokens
