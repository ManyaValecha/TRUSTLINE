import os

from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from app.services.pipeline import analyze_audio, WARNING_AUDIO
from app.services.gnani_stt import GnaniSTTError, resolve_speech_profile
from app.schemas import AnalyzeAudioResponse

MAX_AUDIO_BYTES = 20 * 1024 * 1024
SUPPORTED_AUDIO_TYPES = {
    "audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3", "audio/ogg",
    "audio/mp4", "audio/x-m4a", "audio/flac",
}


def has_supported_audio_signature(data: bytes) -> bool:
    """Accept common browser/audio container signatures, not MIME claims alone."""
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WAVE":
        return True
    if data.startswith(b"ID3") or (len(data) >= 2 and data[0] == 0xFF and data[1] & 0xE0 == 0xE0):
        return True  # MP3 ID3 header or MPEG audio frame sync
    if data.startswith((b"OggS", b"fLaC", b"\x1aE\xdf\xa3")):
        return True  # Ogg, FLAC, or WebM/Matroska EBML
    return len(data) >= 8 and data[4:8] == b"ftyp"  # ISO Base Media / MP4 / M4A
DEFAULT_CORS_ORIGINS = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
}
cors_origins = {
    origin.strip()
    for origin in os.getenv("TRUSTLINE_CORS_ORIGINS", "").split(",")
    if origin.strip()
} or DEFAULT_CORS_ORIGINS

app = FastAPI(
    title="TRUSTLINE API",
    description="AI-powered voice scam protection",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(cors_origins),
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
        "provider_configuration": {
            "gnani": bool(os.getenv("GNANI_API_KEY_ID")),
            "cohere": bool(os.getenv("COHERE_API_KEY")),
            "sarvam": bool(os.getenv("SARVAM_API_KEY")),
        },
        "note": "Configuration only; provider connectivity is not checked by this endpoint.",
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


@app.get("/api/scam-headlines")
async def scam_headlines():
    """Return explicitly illustrative safety patterns when live search is absent."""
    return {
        "success": True,
        "groundedWithGoogleSearch": False,
        "liveSearchAvailable": False,
        "dataMode": "curated_fallback",
        "cached": False,
        "timestamp": None,
        "searchSourcesCount": 0,
        "groundingSources": [],
        "headlines": [
            {
                "id": "example-digital-arrest",
                "title": "Example pattern: fake authority and digital-arrest threats",
                "source": "TRUSTLINE educational example (not a news report)",
                "date": "Illustrative example",
                "category": "Digital Arrest",
                "severity": "HIGH",
                "summary": "A caller may impersonate an official, use threats, and demand urgent payment. This is a generic example, not a recent incident.",
                "preventionTip": "Pause, end the call, and independently verify through an official number you already trust.",
            },
            {
                "id": "example-bank-kyc",
                "title": "Example pattern: bank KYC urgency and credential requests",
                "source": "TRUSTLINE educational example (not a news report)",
                "date": "Illustrative example",
                "category": "Bank KYC",
                "severity": "HIGH",
                "summary": "A caller may claim an account will be frozen and ask for an OTP, PIN, or password. This is a generic example, not a current bulletin.",
                "preventionTip": "Never disclose an OTP or PIN on a call. Contact the bank using a number from its official materials.",
            },
            {
                "id": "example-courier",
                "title": "Example pattern: courier or customs payment demand",
                "source": "TRUSTLINE educational example (not a news report)",
                "date": "Illustrative example",
                "category": "Courier Impersonation",
                "severity": "MEDIUM",
                "summary": "A caller may claim a parcel is seized and request a fee to avoid consequences. This is an illustrative example, not a verified case.",
                "preventionTip": "Do not transfer money under pressure. Contact the courier using its published official channel.",
            },
            {
                "id": "example-family-emergency",
                "title": "Example pattern: family emergency and isolation pressure",
                "source": "TRUSTLINE educational example (not a news report)",
                "date": "Illustrative example",
                "category": "Emergency Fraud",
                "severity": "HIGH",
                "summary": "A caller may claim a loved one is in danger, demand immediate payment, and discourage verification. This is a generic example, not a real incident report.",
                "preventionTip": "Call your relative directly using a number you already trust before sending money.",
            },
        ],
    }


@app.post("/api/analyze", response_model=AnalyzeAudioResponse)
async def analyze_call(
    request: Request,
    audio: UploadFile = File(...),
    speech_language: str = Query("indic-auto"),
    target_language: str = Query("hi-IN"),
):
    try:
        resolve_speech_profile(speech_language)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    if (audio.content_type or "").lower().split(";")[0] not in SUPPORTED_AUDIO_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Transcription accepts WAV, MP3, FLAC, OGG, or M4A audio.",
        )

    if not os.getenv("GNANI_API_KEY_ID"):
        raise HTTPException(
            status_code=503,
            detail=(
                "Audio analysis is unavailable because speech transcription is not "
                "configured for this deployment. The recording was not sent to an "
                "external speech provider. Use Diagnostic Simulator in Settings "
                "or contact the deployment operator."
            ),
        )

    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > MAX_AUDIO_BYTES + 1024 * 1024:
                raise HTTPException(status_code=413, detail="Request exceeds the audio upload limit.")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid request content length.")

    # Read one byte beyond the configured cap to reject oversized files without
    # copying an arbitrarily large upload into application memory.
    audio_bytes = await audio.read(MAX_AUDIO_BYTES + 1)

    if not audio_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded audio file is empty.",
        )

    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Audio file exceeds the 20 MB limit.",
        )

    if not has_supported_audio_signature(audio_bytes):
        raise HTTPException(status_code=400, detail="Audio file content does not match a supported audio format.")

    try:
        return await analyze_audio(
            audio_bytes=audio_bytes,
            filename=audio.filename or "recording.wav",
            speech_language=speech_language,
            target_language=target_language,
            audio_content_type=(audio.content_type or "audio/wav").lower().split(";")[0],
        )

    except GnaniSTTError as error:
        if "HTTP 400" in str(error) or "did not return a successful transcript" in str(error):
            raise HTTPException(
                status_code=422,
                detail=(
                    "The speech provider rejected this recording. Use WAV, MP3, FLAC, "
                    "OGG, or M4A audio no longer than 30 seconds."
                ),
            ) from error
        raise HTTPException(
            status_code=502,
            detail="The speech transcription service could not process this request. Try again later.",
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail="Analysis could not be completed. Check provider configuration and try again later.",
        ) from error
