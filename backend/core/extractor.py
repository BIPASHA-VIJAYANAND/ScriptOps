"""
NLP & Feature Extraction Module
- Rule-based + keyword matching (no ML training needed)
- Extracts: characters, location, scene type, production feature flags
"""

import re

# ── Feature keyword dictionaries ──────────────────────────────────────────────
FEATURE_KEYWORDS: dict[str, list[str]] = {
    "crowd":   ["crowd", "hundreds", "thousands", "mob", "audience", "spectators", "extras", "people gather"],
    "vfx":     ["cgi", "vfx", "green screen", "visual effect", "morph", "transform", "hologram", "digital"],
    "stunt":   ["stunt", "chase", "fight", "crash", "fall", "explosion", "punch", "kick", "jump", "flip"],
    "night":   ["night", "midnight", "dark", "moonlight", "evening"],
    "rain":    ["rain", "storm", "thunder", "downpour", "wet", "lightning", "monsoon"],
    "vehicle": ["car", "truck", "helicopter", "motorcycle", "boat", "plane", "bus", "taxi", "suv", "van"],
    "weapon":  ["gun", "rifle", "sword", "knife", "bomb", "pistol", "grenade", "sniper"],
    "animal":  ["horse", "dog", "animal", "creature", "cat", "bird", "snake", "elephant"],
}

# Words that look like character names but aren't
EXCLUDED_NAMES = {
    "CONT", "CONTINUED", "CUT TO", "FADE IN", "FADE OUT", "DISSOLVE TO",
    "SMASH CUT", "TITLE CARD", "SUPER", "INTERCUT", "BACK TO",
    "THE END", "FLASHBACK", "END FLASHBACK", "MONTAGE", "END MONTAGE",
    "ANGLE ON", "CLOSE ON", "WIDE ON", "INSERT", "SERIES OF SHOTS",
    "MORE", "CONT'D", "V.O.", "O.S.", "O.C.",
}


def extract_scene_type(heading: str) -> dict:
    """Parse INT/EXT and DAY/NIGHT from scene heading."""
    upper = heading.upper()
    is_interior = "INT" in upper
    is_exterior = "EXT" in upper
    is_night = any(t in upper for t in ("NIGHT", "EVENING", "MIDNIGHT"))
    is_dawn_dusk = any(t in upper for t in ("DAWN", "DUSK", "SUNSET", "SUNRISE"))
    if is_night:
        day_night = "NIGHT"
    elif is_dawn_dusk:
        day_night = "DAWN/DUSK"
    else:
        day_night = "DAY"
    return {
        "interior": is_interior,
        "exterior": is_exterior,
        "day_night": day_night,
    }


def extract_location(heading: str) -> str:
    """Extract the location name from a scene heading."""
    loc = re.sub(
        r"^(INT\.|EXT\.|INT/EXT\.|INT\.\/EXT\.|I/E\.)\s*",
        "", heading, flags=re.IGNORECASE,
    )
    loc = re.sub(
        r"\s*[-–—]\s*(DAY|NIGHT|DAWN|DUSK|CONTINUOUS|LATER|EVENING|MORNING|SUNSET|SUNRISE|MOMENTS LATER|SAME).*$",
        "", loc, flags=re.IGNORECASE,
    )
    return loc.strip()


def extract_characters(body: str) -> list[str]:
    """
    Extract character names from scene body.
    In screenplays, character names appear in ALL CAPS centered above dialogue.
    """
    # Match lines with mostly uppercase words (character cues)
    names = re.findall(r"^\s{5,}([A-Z][A-Z\s\.']{1,35})$", body, re.MULTILINE)
    cleaned = set()
    for n in names:
        n = n.strip().rstrip(":")
        # Remove parenthetical directions like (V.O.) (O.S.) (CONT'D)
        n = re.sub(r"\s*\(.*?\)\s*$", "", n).strip()
        if (
            n
            and len(n) > 1
            and n not in EXCLUDED_NAMES
            and not n.startswith("(")
            and len(n.split()) <= 4
        ):
            cleaned.add(n)
    return sorted(cleaned)


def extract_features(body: str) -> dict[str, bool]:
    """Check scene body for production-relevant feature keywords."""
    lower = body.lower()
    return {
        feat: any(kw in lower for kw in keywords)
        for feat, keywords in FEATURE_KEYWORDS.items()
    }


def analyze_scene(scene: dict) -> dict:
    """Run full extraction on a single raw scene dict and return enriched scene."""
    heading = scene["heading"]
    body = scene["body"]
    scene_type = extract_scene_type(heading)
    location = extract_location(heading)
    characters = extract_characters(body)
    features = extract_features(body)

    # Override night feature from heading analysis
    if scene_type["day_night"] == "NIGHT":
        features["night"] = True

    return {
        "scene_number": scene["scene_number"],
        "heading": heading,
        "body": body,
        "location": location,
        "scene_type": scene_type,
        "characters": characters,
        "num_characters": len(characters),
        "features": features,
    }
