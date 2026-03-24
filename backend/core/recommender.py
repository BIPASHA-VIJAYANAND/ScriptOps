import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import os

print("Spinning up HuggingFace SentenceTransformer (all-MiniLM-L6-v2)...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Transformer successfully loaded into memory.")

CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "technicians_dataset_v2.csv")

df = pd.DataFrame()
technician_embeddings = None

if os.path.exists(CSV_PATH):
    df = pd.read_csv(CSV_PATH)
    # Semantic text block describing the creator
    df['combined_features'] = df['Genres'].fillna('') + ". " + df['Style_Tags'].fillna('') + ". " + df['Notable_Projects'].fillna('')
    # Pre-compute all embeddings at startup for zero-latency inference
    technician_embeddings = model.encode(df['combined_features'].tolist())
else:
    print(f"CRITICAL: Dataset not found at {CSV_PATH}")

def calculate_ml_matches(script_keywords: str, max_budget_usd: int, target_roles: list = ["Cinematographer", "Editor", "Music Director"]):
    if df.empty or technician_embeddings is None:
        return []

    # 1. Hard Constraints Filter
    mask = (df['Estimated_Day_Rate_USD'] <= max_budget_usd) & (df['Role'].isin(target_roles))
    filtered_indices = df.index[mask].tolist()

    if not filtered_indices:
        return []

    # 2. Semantic Embedding of Prompt
    keyword_embedding = model.encode([script_keywords])
    
    # Filter the exact precomputed embeddings
    filtered_embeddings = technician_embeddings[filtered_indices]

    # 3. Cosine Similarity Vectorization
    similarities = cosine_similarity(keyword_embedding, filtered_embeddings)[0]

    matches = []
    for i, original_idx in enumerate(filtered_indices):
        semantic_score = similarities[i]
        row = df.iloc[original_idx]
        base_demand = row['Demand_Score']
        
        # ML Ranking Formula: 60% semantic similarity, 40% intrinsic demand score
        final_score = (semantic_score * 6.0) + (base_demand * 0.4)
        
        # Dynamically formulate the "Trade-Offs" response based on budget margin
        budget_margin = max_budget_usd - row['Estimated_Day_Rate_USD']
        trade_offs = "None."
        if budget_margin < 500:
            trade_offs = "Pushes maximum budget ceiling."
        if base_demand < 6.0:
            trade_offs = "Lower mainstream recognition."

        matches.append({
            "creator_name": row["Name"],
            "score": round(final_score, 1),
            "explanation": {
                "why_they_fit": f"Semantic Match: {int(semantic_score * 100)}%. Their established style ({row['Style_Tags']}) syntactically aligns with your specific script requirements.",
                "trade_offs": trade_offs
            },
            "raw_data": {
                "experience_level": f"{row['Years_of_Experience']} YOE",
                "engagement_rate": row["Demand_Tier"],
                "skills": [g.strip() for g in str(row['Genres']).split(",")]
            }
        })

    # Sort descending by Final AI Score
    matches.sort(key=lambda x: x["score"], reverse=True)
    return matches[:3]
