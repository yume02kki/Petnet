import uuid
import os
import random
from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _generate_mock_data() -> pd.DataFrame:
    categories = {
        "Technology": [
            "Machine learning models are transforming how we process natural language data",
            "Cloud computing enables scalable infrastructure for modern applications",
            "Kubernetes orchestrates containerized workloads across distributed clusters",
            "Neural networks can learn complex patterns from large training datasets",
            "API gateway handles authentication and rate limiting for microservices",
            "GraphQL provides a flexible query language for frontend data fetching",
            "Edge computing reduces latency by processing data closer to the source",
            "Transformer architecture revolutionized sequence-to-sequence modeling tasks",
            "DevOps practices bridge the gap between development and operations teams",
            "WebAssembly enables near-native performance for browser-based applications",
            "Continuous integration pipelines automate testing and deployment workflows",
            "Distributed databases ensure high availability through data replication",
            "Serverless functions scale automatically based on incoming request volume",
            "Version control systems track changes and enable team collaboration",
            "Load balancers distribute traffic across multiple backend server instances",
        ],
        "Science": [
            "CRISPR gene editing allows precise modifications to DNA sequences",
            "Quantum entanglement enables instantaneous correlation between particles",
            "Photosynthesis converts light energy into chemical energy in plant cells",
            "Black holes warp spacetime so intensely that light cannot escape",
            "Mitochondria produce ATP through oxidative phosphorylation in cells",
            "Plate tectonics explains the movement of continental landmasses over time",
            "Antibodies bind to specific antigens to neutralize pathogens in the body",
            "The Higgs boson gives mass to fundamental particles via the Higgs field",
            "Enzyme catalysis accelerates biochemical reactions by lowering activation energy",
            "Gravitational waves are ripples in spacetime caused by massive accelerating objects",
            "RNA polymerase transcribes DNA into messenger RNA for protein synthesis",
            "Dark matter makes up roughly 27 percent of the total mass-energy of the universe",
            "Superconductors conduct electricity with zero resistance below critical temperature",
            "Stem cells can differentiate into various specialized cell types in the body",
            "The doppler effect causes frequency shifts in waves from moving sources",
        ],
        "Business": [
            "Revenue diversification reduces risk from dependence on a single income stream",
            "Customer acquisition cost determines the profitability of marketing campaigns",
            "Supply chain optimization minimizes waste and improves delivery timelines",
            "Agile methodology enables iterative product development with regular feedback",
            "Market segmentation identifies distinct customer groups with shared characteristics",
            "Return on investment measures the efficiency of capital allocation decisions",
            "Strategic partnerships create synergies that benefit both organizations equally",
            "Brand positioning differentiates a company from its direct competitors",
            "Cash flow management ensures liquidity for ongoing operational expenses",
            "Stakeholder engagement builds trust and alignment across the organization",
            "Competitive analysis reveals market opportunities and potential threats",
            "Unit economics determine whether a business model is sustainable long-term",
            "Mergers and acquisitions consolidate market share in fragmented industries",
            "Employee retention programs reduce costly turnover and preserve institutional knowledge",
            "Pricing strategy balances profit margins with customer willingness to pay",
        ],
        "Health": [
            "Regular cardiovascular exercise strengthens the heart and improves circulation",
            "Gut microbiome diversity is linked to overall immune system function",
            "Adequate sleep promotes memory consolidation and cellular repair processes",
            "Vaccination stimulates the immune system to produce protective antibodies",
            "Chronic inflammation contributes to many age-related diseases and conditions",
            "Omega-3 fatty acids support brain function and reduce inflammation markers",
            "Mindfulness meditation can reduce cortisol levels and manage stress effectively",
            "Insulin resistance is a precursor to type 2 diabetes and metabolic syndrome",
            "Physical therapy rehabilitates injuries through targeted exercises and stretching",
            "Hydration affects cognitive performance and physical endurance during exercise",
            "Antioxidants protect cells from oxidative damage caused by free radicals",
            "Blood pressure monitoring helps detect hypertension before complications arise",
            "Probiotics may improve digestive health by restoring beneficial gut bacteria",
            "Vitamin D deficiency is associated with weakened bones and immune function",
            "Mental health screening identifies conditions early for more effective treatment",
        ],
        "Environment": [
            "Carbon capture technology removes CO2 directly from the atmosphere",
            "Renewable energy sources like solar and wind reduce fossil fuel dependence",
            "Ocean acidification threatens marine ecosystems and coral reef survival",
            "Deforestation accelerates biodiversity loss and disrupts local water cycles",
            "Electric vehicles produce zero direct emissions during operation",
            "Wetlands act as natural water filters and flood protection systems",
            "Plastic pollution accumulates in ocean gyres affecting marine wildlife",
            "Permafrost thawing releases stored methane amplifying global warming effects",
            "Urban green spaces improve air quality and reduce heat island effects",
            "Sustainable agriculture practices maintain soil health for future generations",
            "Glacier retreat serves as a visible indicator of climate change progression",
            "Circular economy models minimize waste through reuse and recycling strategies",
            "Endangered species protection preserves genetic diversity in natural ecosystems",
            "Water scarcity affects billions of people in arid and semi-arid regions",
            "Reforestation projects sequester carbon and restore degraded landscape habitats",
        ],
    }

    rows = []
    sources = ["Journal", "Blog", "Report", "News", "Paper"]
    for category, texts in categories.items():
        for text in texts:
            rows.append({
                "text": text,
                "category": category,
                "source": random.choice(sources),
                "importance": random.choice(["High", "Medium", "Low"]),
            })

    random.shuffle(rows)
    return pd.DataFrame(rows)


@router.post("/mock")
async def create_mock():
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.xlsx")

    df = _generate_mock_data()
    df.to_excel(file_path, index=False)

    columns = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        sample_values = df[col].dropna().head(3).tolist()
        columns.append({
            "name": str(col),
            "dtype": dtype,
            "sample_values": [str(v) for v in sample_values],
        })

    return {
        "file_id": file_id,
        "filename": "demo_dataset.xlsx",
        "columns": columns,
        "total_rows": len(df),
    }


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only Excel files (.xlsx, .xls) are supported")

    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.xlsx")

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    try:
        df = pd.read_excel(file_path, nrows=5)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Failed to read Excel file: {str(e)}")

    columns = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        sample_values = df[col].dropna().head(3).tolist()
        columns.append({
            "name": str(col),
            "dtype": dtype,
            "sample_values": [str(v) for v in sample_values],
        })

    total_rows = len(pd.read_excel(file_path, usecols=[0]))

    return {
        "file_id": file_id,
        "filename": file.filename,
        "columns": columns,
        "total_rows": total_rows,
    }
