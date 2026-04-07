import hdbscan
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from models.schemas import ClusterInfo


def cluster_embeddings(
    embeddings: np.ndarray,
    min_cluster_size: int = 15,
    min_samples: int = 5,
) -> np.ndarray:
    clusterer = hdbscan.HDBSCAN(
        min_cluster_size=min_cluster_size,
        min_samples=min_samples,
        metric="euclidean",
    )
    labels = clusterer.fit_predict(embeddings)
    return labels


def extract_cluster_keywords(
    texts: list[str],
    labels: np.ndarray,
    top_n: int = 8,
) -> list[ClusterInfo]:
    unique_labels = sorted(set(labels))
    cluster_infos = []

    tfidf = TfidfVectorizer(max_features=10000, stop_words="english", max_df=0.95, min_df=2)

    try:
        tfidf_matrix = tfidf.fit_transform(texts)
        feature_names = tfidf.get_feature_names_out()
    except ValueError:
        for label in unique_labels:
            mask = np.array(labels) == label
            cluster_infos.append(ClusterInfo(
                cluster_id=int(label),
                size=int(mask.sum()),
                keywords=[],
            ))
        return cluster_infos

    for label in unique_labels:
        mask = np.array(labels) == label
        count = int(mask.sum())

        if label == -1:
            cluster_infos.append(ClusterInfo(
                cluster_id=-1,
                size=count,
                keywords=["noise"],
            ))
            continue

        cluster_tfidf = tfidf_matrix[mask].mean(axis=0)
        cluster_array = np.asarray(cluster_tfidf).flatten()
        top_indices = cluster_array.argsort()[-top_n:][::-1]
        keywords = [str(feature_names[i]) for i in top_indices if cluster_array[i] > 0]

        cluster_infos.append(ClusterInfo(
            cluster_id=int(label),
            size=count,
            keywords=keywords,
        ))

    return cluster_infos
