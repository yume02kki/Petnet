from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    file_id: str
    text_column: str
    display_text_column: str | None = None
    metadata_columns: list[str] = []
    min_cluster_size: int = 15
    min_samples: int = 5


class PointData(BaseModel):
    index: int
    x: float
    y: float
    cluster: int
    is_noise: bool
    text: str
    display_text: str | None = None
    metadata: dict = {}


class ClusterInfo(BaseModel):
    cluster_id: int
    size: int
    keywords: list[str]


class AliasPair(BaseModel):
    word_a: str
    word_b: str
    similarity: float
    shared_clusters: list[int]
    sample_contexts_a: list[str]
    sample_contexts_b: list[str]


class AnalyzeResponse(BaseModel):
    points: list[PointData]
    clusters: list[ClusterInfo]
    aliases: list[AliasPair] = []
    total_points: int
    noise_count: int
