"""Shared Gemini helpers. All AI services go through here."""
import json
import re

from app.config import settings


class AIUnavailable(RuntimeError):
    """Raised when the AI backend is not configured (maps to HTTP 503)."""


def get_client():
    if not settings.gemini_api_key:
        raise AIUnavailable("GEMINI_API_KEY is not configured on the backend.")
    from google import genai
    return genai.Client(api_key=settings.gemini_api_key)


def generate_text(prompt: str) -> str:
    response = get_client().models.generate_content(
        model=settings.gemini_model, contents=prompt
    )
    return (response.text or "").strip()


def _extract_json(text: str):
    text = text.strip()
    fenced = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if fenced:
        text = fenced.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Fall back to the outermost {...} or [...] block.
        for open_c, close_c in (("{", "}"), ("[", "]")):
            start, end = text.find(open_c), text.rfind(close_c)
            if start != -1 and end > start:
                try:
                    return json.loads(text[start:end + 1])
                except json.JSONDecodeError:
                    continue
        raise


def generate_json(prompt: str):
    """Ask Gemini for JSON and parse it, tolerating ```json fences."""
    from google.genai import types

    response = get_client().models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )
    return _extract_json(response.text or "")
