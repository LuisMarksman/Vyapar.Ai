import os
import json
from sentence_transformers import SentenceTransformer
import chromadb

# === Paths and Constants ===
HERE = os.path.dirname(__file__)
REPO_ROOT = os.path.join(HERE, '..')
SCHEMES_PATH = os.path.join(REPO_ROOT, 'schemes.json')
PERSIST_DIR = os.path.join(REPO_ROOT, 'chroma_db')
MODEL_NAME = 'all-MiniLM-L6-v2'


# === Helper: Split text into smaller chunks ===
def chunk_text(text, max_len=400):
    """Split long text into smaller chunks (for embedding)."""
    text = text.strip()
    parts = []
    while text:
        if len(text) <= max_len:
            parts.append(text)
            break
        part = text[:max_len]
        last = part.rfind('. ')
        if last != -1 and last > max_len // 2:
            part = part[:last + 1]
        parts.append(part.strip())
        text = text[len(part):].strip()
    return parts


# === Main: Build and persist ChromaDB index ===
def build_index():
    print("🔧 Building Chroma index...")

    # Load model
    model = SentenceTransformer(MODEL_NAME)

    # ✅ Use new PersistentClient (Chroma v0.5+)
    client = chromadb.PersistentClient(path=PERSIST_DIR)

    # Delete existing collection if exists
    try:
        client.delete_collection("biz_docs")
        print("🗑️  Old collection deleted.")
    except Exception:
        pass

    # Create new collection
    collection = client.get_or_create_collection("biz_docs")

    # Load schemes data
    with open(SCHEMES_PATH, 'r', encoding='utf-8') as f:
        schemes = json.load(f)

    docs = []
    for s in schemes:
        text = s.get('description', '')
        parts = chunk_text(text, max_len=400)
        for i, p in enumerate(parts):
            docs.append({
                'id': f"scheme::{s['id']}::{i}",
                'text': p,
                'meta': {
                    'type': 'scheme',
                    'scheme_id': s['id'],
                    'scheme_name': s['name'],
                    'url': s.get('url', '')
                }
            })

    if not docs:
        print("⚠️ No documents found in schemes.json. Check your file.")
        return

    # Encode and add to Chroma
    texts = [d['text'] for d in docs]
    ids = [d['id'] for d in docs]
    metadatas = [d['meta'] for d in docs]
    embeddings = model.encode(texts).tolist()

    collection.add(
        ids=ids,
        documents=texts,
        metadatas=metadatas,
        embeddings=embeddings
    )

    print(f"✅ Added {len(ids)} documents to collection 'biz_docs'.")
    print(f"📦 Persisted at: {PERSIST_DIR}")


# === Entry Point ===
if __name__ == "__main__":
    build_index()
