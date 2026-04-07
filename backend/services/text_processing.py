import re
import unicodedata


def clean_texts(texts: list[str]) -> list[str]:
    return [_clean_single(t) for t in texts]


def _clean_single(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = re.sub(r"http\S+|www\.\S+", "", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"[^\w\s.,!?;:'\"-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()
