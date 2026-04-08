import re
import numpy as np
from collections import defaultdict
from sklearn.feature_extraction.text import CountVectorizer
from services.vectorizer import generate_embeddings


def detect_aliases(
    texts: list[str],
    labels: np.ndarray,
    embeddings: np.ndarray,
    min_occurrences: int = 2,
    max_results: int = 50,
) -> list[dict]:
    """
    Detect words used as codenames/aliases using two signals:
    1. Context gap: high contextual similarity but low word-level similarity
    2. Substitution test: replacing word A with word B in A's sentences
       produces embeddings closer to the cluster centroid

    This catches codenames like "pony" used to mean "calico cat".
    """
    unique_labels = [l for l in sorted(set(labels)) if l != -1]
    if not unique_labels:
        return []

    vectorizer = CountVectorizer(
        stop_words="english",
        min_df=min_occurrences,
        max_df=0.9,
        token_pattern=r"(?u)\b[a-zA-Z]{3,}\b",
    )

    try:
        count_matrix = vectorizer.fit_transform(texts)
    except ValueError:
        return []

    vocab = vectorizer.get_feature_names_out()
    count_array = count_matrix.toarray()

    word_text_indices: dict[str, list[int]] = defaultdict(list)
    word_clusters: dict[str, set[int]] = defaultdict(set)

    for word_idx, word in enumerate(vocab):
        for text_idx in range(len(texts)):
            if count_array[text_idx, word_idx] > 0:
                cluster = int(labels[text_idx])
                if cluster != -1:
                    word_text_indices[word].append(text_idx)
                    word_clusters[word].add(cluster)

    candidate_words = [w for w in vocab if len(word_text_indices[w]) >= min_occurrences]
    if len(candidate_words) < 2:
        return []

    # Context embeddings (average sentence embedding per word)
    word_ctx_emb = {}
    for word in candidate_words:
        indices = word_text_indices[word]
        avg = embeddings[indices].mean(axis=0)
        norm = np.linalg.norm(avg)
        if norm > 0:
            word_ctx_emb[word] = avg / norm

    # Word-level embeddings
    word_list = [w for w in candidate_words if w in word_ctx_emb]
    if len(word_list) < 2:
        return []

    raw_word_embs = generate_embeddings(word_list)
    word_emb = {w: raw_word_embs[i] for i, w in enumerate(word_list)}

    # Cluster centroids
    cluster_centroids = {}
    for cl in unique_labels:
        mask = labels == cl
        centroid = embeddings[mask].mean(axis=0)
        norm = np.linalg.norm(centroid)
        if norm > 0:
            cluster_centroids[cl] = centroid / norm

    # Score pairs
    alias_pairs = []
    seen = set()

    for i in range(len(word_list)):
        for j in range(i + 1, len(word_list)):
            w1, w2 = word_list[i], word_list[j]

            if _share_stem(w1, w2):
                continue

            shared_clusters = word_clusters[w1] & word_clusters[w2]
            if not shared_clusters:
                continue

            ctx_sim = float(word_ctx_emb[w1] @ word_ctx_emb[w2])
            word_sim = float(word_emb[w1] @ word_emb[w2])
            gap = ctx_sim - word_sim

            if gap < 0.05:
                continue
            if ctx_sim < 0.3:
                continue

            pair_key = tuple(sorted([w1, w2]))
            if pair_key in seen:
                continue
            seen.add(pair_key)

            samples_w1 = [texts[idx] for idx in word_text_indices[w1][:2]]
            samples_w2 = [texts[idx] for idx in word_text_indices[w2][:2]]

            alias_pairs.append({
                "word_a": w1,
                "word_b": w2,
                "similarity": round(ctx_sim, 3),
                "shared_clusters": sorted(shared_clusters),
                "sample_contexts_a": samples_w1,
                "sample_contexts_b": samples_w2,
                "_gap": gap,
                "_word_sim": word_sim,
            })

    # Substitution boost: for top candidates, test if replacing w1 with w2
    # in w1's sentences makes them more similar to the cluster centroid
    for pair in alias_pairs:
        w1, w2 = pair["word_a"], pair["word_b"]
        boost = 0.0

        for wa, wb in [(w1, w2), (w2, w1)]:
            indices = word_text_indices[wa][:4]
            if not indices:
                continue

            original_texts = [texts[idx] for idx in indices]
            substituted = [re.sub(r'\b' + re.escape(wa) + r'\b', wb, t, flags=re.IGNORECASE)
                          for t in original_texts]

            # Only test if substitution actually changed something
            changed = [s for s, o in zip(substituted, original_texts) if s != o]
            if not changed:
                continue

            sub_embs = generate_embeddings(changed)
            orig_embs = embeddings[indices[:len(changed)]]

            # Compare to shared cluster centroids
            for cl in pair["shared_clusters"]:
                if cl in cluster_centroids:
                    centroid = cluster_centroids[cl]
                    orig_sim = float(np.mean([e @ centroid for e in orig_embs]))
                    sub_sim = float(np.mean([e @ centroid for e in sub_embs]))
                    # If substituted version is closer to centroid, it's a codename
                    boost += max(0, sub_sim - orig_sim)

        pair["_boost"] = boost

    # Final score: gap + substitution boost
    for pair in alias_pairs:
        pair["_score"] = pair["_gap"] + pair["_boost"] * 3.0

    alias_pairs.sort(key=lambda x: x["_score"], reverse=True)

    # Clean up internal fields
    for pair in alias_pairs:
        del pair["_gap"]
        del pair["_word_sim"]
        del pair["_boost"]
        del pair["_score"]

    return alias_pairs[:max_results]


def _share_stem(w1: str, w2: str) -> bool:
    w1, w2 = w1.lower(), w2.lower()
    if w1 in w2 or w2 in w1:
        return True
    prefix_len = 0
    for a, b in zip(w1, w2):
        if a == b:
            prefix_len += 1
        else:
            break
    if prefix_len >= 5:
        return True
    return False
