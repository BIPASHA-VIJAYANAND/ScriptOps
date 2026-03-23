# ScriptOps: AI-Powered Film Production Assistant 🎬

**ScriptOps** is an advanced, full-stack application designed to revolutionize film pre-production. It analyzes screenplay text, automatically splits it into scenes, extracts logistical features (VFX, stunts, locations), calculates budget and risk estimates, and provides actionable insights powered by **Groq** and the **LLaMA 3.3** model.

## ✨ Features

- **Automated Script Parsing:** Upload your screenplay (`.txt`) and watch it get instantly tokenized into a structured breakdown of scenes, locations, character counts, and day/night sequences.
- **Risk & Budget Estimation:** Algorithmically detects high-risk elements (stunts, animals, VFX, pyrotechnics) and calculates estimated budgets and production risk scores (0-100) per scene.
- **Dynamic Visual Dashboards:**
  - **Risk Heatmap:** Quickly spot problematic scenes across your entire shooting schedule.
  - **Budget Distribution:** Interactive charts analyzing cost breakdowns across location types and sequence types.
- **What-If Simulator:** Tweak scene parameters (e.g., changing a VFX-heavy Night shoot to a Day shoot) and watch the estimated budget recalculate in real-time.
- **AI Production Assistant (Powered by Groq):** 
  - **Scene & Overall Insights:** Instant executive summaries, key production concerns, cost optimization recommendations, and predicted shooting days.
  - **Interactive Chatbot:** Chat directly with the AI, which acts as your production manager and is deeply aware of the script context, budget parameters, and scene complexities.
- **Graceful In-Memory Store:** Full Supabase support for persistent databases exists, but the app flawlessly degrades to in-memory state so you can run it immediately without external databases.

## 🚀 Tech Stack

- **Backend:** Python, FastAPI, Uvicorn, Pydantic, Groq SDK.
- **Frontend:** React, Vite, Recharts, Custom CSS (Dark Mode Glassmorphic UI).
- **AI:** Groq Inference Engine (`llama-3.3-70b-versatile`).

## 🛠️ Setup Instructions

### 1. Requirements
Ensure you have the following installed:
- Python 3.9+
- Node.js (v16+)
- A [Groq API Key](https://console.groq.com/keys)

### 2. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn pydantic python-dotenv groq python-multipart
   ```
3. Configure Environment Variables:
   Create a `.env` file in the `backend/` directory:
   ```env
   # Required for AI features
   GROQ_API_KEY=your_groq_api_key_here
   
   # Optional: For persistent storage
   SUPABASE_URL=
   SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_KEY=
   ```
4. Start the FastAPI server:
   ```bash
   python -m uvicorn main:app --port 8000 --reload
   ```

### 3. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 4. Running the App
Open your browser and navigate to `http://localhost:5173`. 
Upload the included `sample_script.txt` (or your own formatted screenplay) and start exploring the insights!

## 📁 Repository Structure

```
ScriptOps/
├── backend/
│   ├── api/             # API Router Endpoints (upload, insights, auth, operations)
│   ├── core/            # Business logic (script parser, Groq LLM client, Supabase)
│   ├── models/          # Pydantic Schemas
│   ├── main.py          # FastAPI Application Entry Point
│   └── .env             # Global Backend Configuration
├── frontend/
│   ├── src/
│   │   ├── components/  # React UI Components (InsightsPanel, FileUpload, etc.)
│   │   ├── App.jsx      # Main Application Container & Dashboard Layout
│   │   └── components.css # Modern Styling System
│   ├── package.json     # Node Dependencies
│   └── vite.config.js   # Vite Bundler Config
└── sample_script.txt    # Example screenplay for testing
```
