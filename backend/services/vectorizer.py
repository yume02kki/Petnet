import os
from sentence_transformers import SentenceTransformer
import numpy as np

_model = None

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models", "all-MiniLM-L6-v2")


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_DIR)
    return _model


def generate_embeddings(texts: list[str], batch_size: int = 64) -> np.ndarray:
    model = _get_model()
    embeddings = model.encode(
        texts,
        batch_size=batch_size,
        show_progress_bar=False,
        normalize_embeddings=True,
    )
    return np.array(embeddings)
