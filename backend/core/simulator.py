"""
What-If Simulation Engine
- Accepts scene data + user modifications
- Recalculates risk score and budget
- Returns comparison (original vs modified)
"""

import copy
from .risk_engine import compute_risk_score, estimate_budget, get_risk_level


def simulate_whatif(original_scene: dict, modifications: dict) -> dict:
    """
    Apply modifications to a scene and recalculate risk & budget.
    
    modifications can include:
      - features: dict of feature overrides, e.g. {"stunt": True, "vfx": False}
      - day_night: "DAY" or "NIGHT"
      - num_characters: int
      - interior: bool
      - exterior: bool
    
    Returns dict with original and modified values + deltas.
    """
    scene = copy.deepcopy(original_scene)

    # Apply feature overrides
    if "features" in modifications:
        scene["features"].update(modifications["features"])

    # Apply scene type overrides
    if "day_night" in modifications:
        scene["scene_type"]["day_night"] = modifications["day_night"]
        scene["features"]["night"] = modifications["day_night"] == "NIGHT"

    if "interior" in modifications:
        scene["scene_type"]["interior"] = modifications["interior"]

    if "exterior" in modifications:
        scene["scene_type"]["exterior"] = modifications["exterior"]

    if "num_characters" in modifications:
        scene["num_characters"] = modifications["num_characters"]

    # Recalculate
    new_risk = compute_risk_score(scene["features"], scene["scene_type"])
    new_budget = estimate_budget(
        scene["features"], scene["scene_type"], scene.get("num_characters", 0)
    )
    new_level = get_risk_level(new_risk)

    return {
        "scene_number": scene["scene_number"],
        "heading": scene["heading"],
        "original_risk": original_scene.get("risk_score", 0),
        "modified_risk": new_risk,
        "delta_risk": new_risk - original_scene.get("risk_score", 0),
        "original_budget": original_scene.get("budget", 0),
        "modified_budget": new_budget,
        "delta_budget": new_budget - original_scene.get("budget", 0),
        "original_risk_level": original_scene.get("risk_level", "LOW"),
        "modified_risk_level": new_level,
        "modified_features": scene["features"],
        "modified_scene_type": scene["scene_type"],
        "modified_num_characters": scene.get("num_characters", 0),
    }
