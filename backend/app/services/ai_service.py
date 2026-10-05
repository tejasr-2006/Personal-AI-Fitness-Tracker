
from app.services.ai_client import generate_json


def _num(value):
    try:
        return float(value) if value is not None else None
    except (TypeError, ValueError):
        return None


def parse_food_text(text: str):

    prompt = f"""
You are a nutrition food parser.

Convert the user's food description into structured JSON.

User:
{text}

Return ONLY valid JSON in this format:

{{
    "items": [
        {{
            "food_name": "string",
            "quantity": 1,
            "unit": "piece",
            "calories": 0,
            "protein": 0,
            "carbohydrates": 0,
            "fat": 0,
            "fiber": 0
        }}
    ]
}}

Rules:
- Identify every food mentioned.
- Identify the quantity when mentioned.
- Do not invent foods that were not mentioned.
- Estimate nutrition values when necessary.
- All nutrition values must be numbers.
"""

    result = generate_json(prompt)
    items = result.get("items", []) if isinstance(result, dict) else result
    cleaned = []
    for item in items:
        if not isinstance(item, dict) or not item.get("food_name"):
            continue
        cleaned.append({
            "food_name": str(item["food_name"])[:200],
            "quantity": _num(item.get("quantity")),
            "unit": item.get("unit") and str(item["unit"])[:50],
            "calories": _num(item.get("calories")),
            "protein": _num(item.get("protein")),
            "carbohydrates": _num(item.get("carbohydrates")),
            "fat": _num(item.get("fat")),
            "fiber": _num(item.get("fiber")),
        })
    return cleaned