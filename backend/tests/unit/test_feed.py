import pytest
import math
from app.domains.feed.tasks import compute_trending_score, DECAY_LAMBDA


def test_trending_score_no_decay():
    """Score with 0 age_days should be raw score."""
    score = compute_trending_score(views=10, likes=5, age_days=0)
    expected = 10 * 1.0 + 5 * 3.0  # 25.0
    assert score == expected


def test_trending_score_decay():
    """Score at half-life (3 days) should be ~50% of raw."""
    raw = 10 * 1.0 + 5 * 3.0
    score = compute_trending_score(views=10, likes=5, age_days=3.0)
    assert abs(score - raw * 0.5) < 0.01


def test_trending_score_ordering():
    """More recent activity should rank higher than older activity."""
    recent = compute_trending_score(views=20, likes=10, age_days=1)
    old = compute_trending_score(views=20, likes=10, age_days=6)
    assert recent > old


def test_content_length_validation():
    """Post content > 5000 and comment content > 2000 should fail Pydantic validation."""
    from app.domains.feed.schemas import PostCreate, CommentCreate
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        PostCreate(content="x" * 5001)

    with pytest.raises(ValidationError):
        CommentCreate(content="x" * 2001)


def test_content_length_valid():
    """Content within limits should pass validation."""
    from app.domains.feed.schemas import PostCreate, CommentCreate

    post = PostCreate(content="Hello world")
    assert len(post.content) <= 5000

    comment = CommentCreate(content="Nice post!")
    assert len(comment.content) <= 2000
