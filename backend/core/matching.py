from typing import List, Dict

# Component Weights (Sum to 1.0)
W_SKILL = 0.40      # Hard skills are non-negotiable
W_COST = 0.30       # Budget is a hard constraint
W_EXP = 0.20        # Experience dictates execution risk
W_ENGAGEMENT = 0.10 # Social pull is a bonus

MOCK_CREATORS = [
    {
        "creator_id": "c_101",
        "name": "Alex Lighting",
        "skills": ["Cinematography", "Lighting", "VFX"],
        "tools_used": ["Arri Alexa", "Blender"],
        "engagement_rate": "5.2%",
        "experience_level": "Expert",
        "price_range": "Medium"
    },
    {
        "creator_id": "c_102",
        "name": "Sarah Action",
        "skills": ["Stunts", "Choreography", "Directing"],
        "tools_used": ["Wire Rigs", "Previs"],
        "engagement_rate": "3.8%",
        "experience_level": "Intermediate",
        "price_range": "Low"
    },
    {
        "creator_id": "c_103",
        "name": "Marcus Night",
        "skills": ["Crowd_Control", "Lighting"],
        "tools_used": ["Aputure", "Megaphones"],
        "engagement_rate": "1.1%",
        "experience_level": "Beginner",
        "price_range": "Low"
    },
    {
        "creator_id": "c_104",
        "name": "Elena Visuals",
        "skills": ["VFX", "Color Grading", "Editing"],
        "tools_used": ["Nuke", "DaVinci Resolve"],
        "engagement_rate": "8.4%",
        "experience_level": "Expert",
        "price_range": "High"
    },
    {
        "creator_id": "c_105",
        "name": "John Steady",
        "skills": ["Cinematography", "Stunts"],
        "tools_used": ["Steadicam", "RED"],
        "engagement_rate": "2.5%",
        "experience_level": "Intermediate",
        "price_range": "High"
    }
]

def calculate_skill_match(script: dict, creator: dict) -> float:
    """Calculates skill overlap (0 to 1)."""
    required_skills = []
    if script.get("needs_vfx"): required_skills.append("vfx")
    if script.get("needs_stunts"): required_skills.append("stunts")
    if script.get("needs_night_shoot"): required_skills.append("lighting")
    if script.get("needs_crowd"): required_skills.append("crowd_control")
    
    if not required_skills: return 1.0 # No specific hard skills needed
    
    creator_skills = [s.lower() for s in creator.get("skills", [])]
    matches = sum(1 for req in required_skills if req in creator_skills)
    
    return matches / len(required_skills)

def calculate_cost_fit(script_budget: str, creator_price: str) -> float:
    """
    Script Low vs Creator High -> 0.0 (Impossible)
    Script High vs Creator Low -> 1.0 (Bargain)
    Exact match -> 1.0
    """
    tiers = {"low": 1, "medium": 2, "high": 3}
    budget_val = tiers.get(script_budget.lower(), 2)
    price_val = tiers.get(creator_price.lower(), 2)
    
    delta = budget_val - price_val
    if delta >= 0:
        return 1.0  # Within budget or cheaper
    elif delta == -1:
        return 0.4  # Slightly over budget (penalize)
    else:
        return 0.0  # Way over budget (heavy penalty)

def score_creator(script: dict, creator: dict) -> dict:
    # 1. Skill Match (0-10)
    skill_score = calculate_skill_match(script, creator) * 10
    
    # 2. Cost Fit (0-10)
    cost_score = calculate_cost_fit(script.get("budget_level", "medium"), creator.get("price_range", "medium")) * 10
    
    # 3. Experience Score (0-10)
    exp_map = {"expert": 10, "intermediate": 6, "beginner": 3}
    exp_score = exp_map.get(creator.get("experience_level", "intermediate").lower(), 6)
    
    # Optional: Boost expectation if script complexity is high
    if script.get("complexity_level") == "high" and exp_score < 10:
        exp_score *= 0.7 # Penalize non-experts on complex scripts
        
    # 4. Engagement Score (0-10)
    raw_eng = float(str(creator.get("engagement_rate", "0")).replace("%", ""))
    eng_score = min(raw_eng * 2, 10.0) # Cap at 10 (5% engagement is stellar)
    
    # Final Weighted Calculation
    final_score = (
        (W_SKILL * skill_score) +
        (W_COST * cost_score) +
        (W_EXP * exp_score) +
        (W_ENGAGEMENT * eng_score)
    )
    
    return {
        "final_score": round(final_score, 1),
        "breakdown": {
            "skill": round(skill_score, 1),
            "cost": round(cost_score, 1),
            "experience": round(exp_score, 1),
            "engagement": round(eng_score, 1)
        }
    }

def generate_explanations(script: dict, ranked_creators: List[dict]):
    for match in ranked_creators:
        bd = match["breakdown"]
        reasons = []
        tradeoffs = []
        
        # Skill logic
        if bd["skill"] == 10:
            reasons.append("Perfect technical skill match for your script's specific requirements.")
        elif bd["skill"] >= 5:
            reasons.append("Has some overlapping skills, but might require a secondary crew member.")
        else:
            reasons.append("Brings generalized experience but lacks core required skills.")
            
        # Cost logic
        if bd["cost"] == 10:
            reasons.append("Fits safely within your target budget.")
        else:
            tradeoffs.append("Their quote exceeds your budget tier, but their expertise might be worth the stretch.")
            
        # Experience vs Complexity
        if script.get("complexity_level", "medium").lower() == "high" and bd["experience"] >= 9:
            reasons.append("Veteran experience level is highly recommended for this script's complexity.")
            
        match["explanation"] = {
            "why_they_fit": " ".join(reasons).strip(),
            "trade_offs": " ".join(tradeoffs).strip() if tradeoffs else "None."
        }
    return ranked_creators

def rank_creators(script_reqs: dict, creators: List[dict], top_n: int = 5) -> List[dict]:
    results = []
    for c in creators:
        scoring = score_creator(script_reqs, c)
        results.append({
            "creator_id": c["creator_id"],
            "creator_name": c.get("name", "Unknown"),
            "score": scoring["final_score"],
            "breakdown": scoring["breakdown"],
            "raw_data": c
        })
    
    # Sort descending by final score
    ranked = sorted(results, key=lambda x: x["score"], reverse=True)
    return ranked[:top_n]
