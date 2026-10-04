import json
import os

from google import genai


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


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

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    result = json.loads(response.text)

    return result["items"]