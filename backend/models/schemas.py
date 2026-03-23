"""Pydantic models for API request/response validation."""

from pydantic import BaseModel, Field
from typing import Optional


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    selected_scene_id: Optional[int] = None


class ChatResponse(BaseModel):
    response: str



class SceneType(BaseModel):
    interior: bool = False
    exterior: bool = False
    day_night: str = "DAY"


class SceneFeatures(BaseModel):
    crowd: bool = False
    vfx: bool = False
    stunt: bool = False
    night: bool = False
    rain: bool = False
    vehicle: bool = False
    weapon: bool = False
    animal: bool = False


class SceneResponse(BaseModel):
    scene_number: int
    heading: str
    body: str = ""
    location: str = ""
    scene_type: SceneType
    characters: list[str] = []
    num_characters: int = 0
    features: dict[str, bool] = {}
    risk_score: int = 0
    budget: int = 0
    risk_level: str = "LOW"


class AnalysisResponse(BaseModel):
    script_title: str = ""
    total_scenes: int = 0
    total_budget: int = 0
    avg_risk_score: float = 0.0
    high_risk_scenes: int = 0
    scenes: list[SceneResponse] = []


class UploadResponse(BaseModel):
    status: str
    total_scenes: int
    script_title: str


class WhatIfRequest(BaseModel):
    features: Optional[dict[str, bool]] = None
    day_night: Optional[str] = None
    num_characters: Optional[int] = None
    interior: Optional[bool] = None
    exterior: Optional[bool] = None


class WhatIfResponse(BaseModel):
    scene_number: int
    heading: str
    original_risk: int
    modified_risk: int
    delta_risk: int
    original_budget: int
    modified_budget: int
    delta_budget: int
    original_risk_level: str
    modified_risk_level: str
    modified_features: dict[str, bool]
    modified_scene_type: dict
    modified_num_characters: int
