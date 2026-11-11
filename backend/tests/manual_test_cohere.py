import json

from app.services.cohere_analyzer import (
    analyze_transcript,
    CohereAnalysisError,
)

transcript = """
another voice note i don't even know this language how am i
supposed to understand it and even if i translate the words
i still have to figure out the audio myself not just text
from speech all the way back to speech so i'm not forced
to accept the 1st result blindly
"""

print("Sending Gnani transcript to Cohere...")

try:
    result = analyze_transcript(transcript)

    print("\nCOHERE ANALYSIS SUCCESSFUL")
    print(json.dumps(result, indent=4))

except CohereAnalysisError as error:
    print("\nCOHERE ANALYSIS FAILED:", error)

