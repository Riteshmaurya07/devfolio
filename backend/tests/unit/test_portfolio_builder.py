import pytest
from app.domains.portfolio.theme_engine import resolve_theme_tokens, THEMES
from app.domains.portfolio.schemas import PortfolioConfigBase

def test_theme_token_resolution():
    # 1. Default Minimal theme
    tokens_minimal = resolve_theme_tokens("minimal")
    assert tokens_minimal["--bg-primary"] == "#ffffff"
    assert tokens_minimal["--accent-color"] == "#2563eb"

    # 2. Glass theme with custom primary color override
    tokens_glass = resolve_theme_tokens("glass", primary_color="#ff007f")
    assert tokens_glass["--accent-color"] == "#ff007f"
    assert tokens_glass["--glass-backdrop"] == "blur(16px)"

    # 3. Unknown theme fallback
    tokens_fallback = resolve_theme_tokens("unknown_theme")
    assert tokens_fallback == THEMES["modern"]

def test_slug_validation():
    # Valid slugs
    valid_portfolio = PortfolioConfigBase(slug="my-cool-portfolio")
    assert valid_portfolio.slug == "my-cool-portfolio"

    # Reserved word slug rejected
    with pytest.raises(ValueError):
        PortfolioConfigBase(slug="admin")
