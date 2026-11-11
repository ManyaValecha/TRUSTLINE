from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from app.services.pipeline import analyze_audio, WARNING_AUDIO

app = FastAPI(
    title="TRUSTLINE API",
    description="AI-powered voice scam protection",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def home():
    return {
        "success": True,
        "message": "TRUSTLINE backend is running!",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "services": ["Gnani Prisma", "Cohere", "Sarvam", "Gnani Timbre"],
    }


@app.get("/api/warnings/audio")
async def get_warning_audio():
    if not WARNING_AUDIO.exists():
        raise HTTPException(
            status_code=404,
            detail="No generated warning audio is available yet.",
        )

    return FileResponse(
        path=WARNING_AUDIO,
        media_type="audio/wav",
        filename="trustline_warning.wav",
    )


@app.post("/api/analyze")
async def analyze_call(
    audio: UploadFile = File(...),
    speech_language: str = Query("en-IN"),
    target_language: str = Query("hi-IN"),
):
    if not audio.content_type or not audio.content_type.startswith("audio/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid audio file.",
        )

    audio_bytes = await audio.read()

    if not audio_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded audio file is empty.",
        )

    if len(audio_bytes) > 20 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Audio file exceeds the 20 MB limit.",
        )

    try:
        return await analyze_audio(
            audio_bytes=audio_bytes,
            filename=audio.filename or "recording.wav",
            speech_language=speech_language,
            target_language=target_language,
        )

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Audio analysis failed: {error}",
        ) from error
