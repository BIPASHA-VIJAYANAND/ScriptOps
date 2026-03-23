"""
REST API routes for the Script Intelligence system.
All endpoints under /api/v1/
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from ..core.parser import extract_text_from_file, split_into_scenes
from ..core.extractor import analyze_scene
from ..core.risk_engine import analyze_risk_and_cost
from ..core.simulator import simulate_whatif
from ..core.llm_service import generate_scene_insight, generate_overall_insight
from ..models.schemas import (
    UploadResponse, AnalysisResponse, WhatIfRequest, WhatIfResponse,
    ChatRequest, ChatResponse
)

router = APIRouter(prefix="/api/v1")

# ── In-memory store ──────────────────────────────────────────────────────────
_store: dict = {
    "script_title": "",
    "raw_text": "",
    "scenes": [],         # List of fully analyzed scene dicts
}


def _get_analysis_summary() -> dict:
    """Build summary statistics from stored scenes."""
    scenes = _store["scenes"]
    if not scenes:
        return {
            "script_title": _store["script_title"],
            "total_scenes": 0,
            "total_budget": 0,
            "avg_risk_score": 0.0,
            "high_risk_scenes": 0,
            "scenes": [],
        }
    total_budget = sum(s["budget"] for s in scenes)
    avg_risk = sum(s["risk_score"] for s in scenes) / len(scenes)
    high_risk = sum(1 for s in scenes if s["risk_score"] >= 50)
    return {
        "script_title": _store["script_title"],
        "total_scenes": len(scenes),
        "total_budget": total_budget,
        "avg_risk_score": round(avg_risk, 1),
        "high_risk_scenes": high_risk,
        "scenes": scenes,
    }


# ── Upload ────────────────────────────────────────────────────────────────────
@router.post("/upload", response_model=UploadResponse)
async def upload_script(script: UploadFile = File(...)):
    """Upload a script file (PDF or text) and process it."""
    if not script.filename:
        raise HTTPException(400, "No file provided")

    file_bytes = await script.read()
    if not file_bytes:
        raise HTTPException(400, "Empty file")

    # 1. Extract text
    raw_text = extract_text_from_file(script.filename, file_bytes)
    if not raw_text.strip():
        raise HTTPException(422, "Could not extract text from the uploaded file")

    # 2. Split into scenes
    raw_scenes = split_into_scenes(raw_text)

    # 3. Extract features + compute risk/cost for each scene
    analyzed_scenes = []
    for raw_scene in raw_scenes:
        enriched = analyze_scene(raw_scene)
        enriched = analyze_risk_and_cost(enriched)
        analyzed_scenes.append(enriched)

    # 4. Store in memory
    _store["script_title"] = script.filename
    _store["raw_text"] = raw_text
    _store["scenes"] = analyzed_scenes

    return UploadResponse(
        status="success",
        total_scenes=len(analyzed_scenes),
        script_title=script.filename,
    )


# ── Scenes ────────────────────────────────────────────────────────────────────
@router.get("/scenes")
async def get_scenes():
    """Return all parsed and analyzed scenes."""
    if not _store["scenes"]:
        raise HTTPException(404, "No script uploaded yet")
    return {"scenes": _store["scenes"]}


@router.get("/scenes/{scene_id}")
async def get_scene(scene_id: int):
    """Return a single scene by scene_number."""
    for s in _store["scenes"]:
        if s["scene_number"] == scene_id:
            return s
    raise HTTPException(404, f"Scene {scene_id} not found")


# ── Analysis ──────────────────────────────────────────────────────────────────
@router.get("/analysis")
async def get_analysis():
    """Return the full analysis with all scenes and summary stats."""
    if not _store["scenes"]:
        raise HTTPException(404, "No script uploaded yet")
    return _get_analysis_summary()


# ── What-If ───────────────────────────────────────────────────────────────────
@router.post("/whatif/{scene_id}", response_model=WhatIfResponse)
async def whatif_scene(scene_id: int, body: WhatIfRequest):
    """Simulate what-if modifications on a scene."""
    original = None
    for s in _store["scenes"]:
        if s["scene_number"] == scene_id:
            original = s
            break
    if original is None:
        raise HTTPException(404, f"Scene {scene_id} not found")

    modifications = body.model_dump(exclude_none=True)
    result = simulate_whatif(original, modifications)
    return WhatIfResponse(**result)


# ── LLM Insights ─────────────────────────────────────────────────────────────
@router.get("/insights")
async def get_overall_insights():
    """Generate LLM-powered overall script insights."""
    if not _store["scenes"]:
        raise HTTPException(404, "No script uploaded yet")
    analysis = _get_analysis_summary()
    insights = await generate_overall_insight(analysis)
    return insights


@router.get("/insights/{scene_id}")
async def get_scene_insight(scene_id: int):
    """Generate LLM-powered insight for a single scene."""
    for s in _store["scenes"]:
        if s["scene_number"] == scene_id:
            insight = await generate_scene_insight(s)
            return insight
    raise HTTPException(404, f"Scene {scene_id} not found")

@router.post("/insights/chat", response_model=ChatResponse)
async def chat_interaction(body: ChatRequest):
    """Send message to LLM directly."""
    if not _store["scenes"]:
        raise HTTPException(404, "No script uploaded yet")
    from ..core.llm_service import chat_with_script
    analysis = _get_analysis_summary()
    response_text = await chat_with_script(
        analysis, 
        [m.model_dump() for m in body.messages], 
        body.selected_scene_id
    )
    return ChatResponse(response=response_text)
