"""
rag_advisor.py
--------------
Retrieval-Augmented AI Advisor for MSMEs.
Combines RAG (local reasoning) + optional Gemini polish.
"""

import os
import json
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import requests

# --- Globals ---
HERE = os.path.dirname(__file__)
REPO_ROOT = os.path.join(HERE, '..')
PERSIST_DIR = os.path.join(REPO_ROOT, 'chroma_db')
MODEL_NAME = 'all-MiniLM-L6-v2'

_model = None
_client = None
_collection = None


# --- Ensure model and collection ---
def _ensure():
    global _model, _client, _collection
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    if _client is None:
        _client = chromadb.PersistentClient(path=PERSIST_DIR)
    try:
        _collection = _client.get_collection("biz_docs")
    except Exception:
        _collection = None


# --- Retrieve relevant documents ---
def _retrieve_docs(query, n_results=5):
    _ensure()
    if not _collection:
        return []
    res = _collection.query(query_texts=[query], n_results=n_results)
    docs = []
    for doc, meta in zip(res["documents"][0], res["metadatas"][0]):
        docs.append({"text": doc, "meta": meta})
    return docs


# --- Compute numeric insights from snapshot ---
def _compute_snapshot_insights(user_snapshot):
    invoices = user_snapshot.get("invoices", [])
    total = sum(i.get("amount", 0) for i in invoices)
    count = len(invoices)
    avg = total / count if count else 0
    top_sku = user_snapshot.get("top_sku", {})
    return {
        "total_sales": total,
        "invoice_count": count,
        "avg_invoice": avg,
        "top_sku": top_sku
    }


# --- Helper to generate structured evidence for Gemini ---
def _format_evidence(docs, max_chars=400):
    evidences = []
    for d in docs:
        text = d.get("text", "").strip().replace("\n", " ")
        snippet = (text[:max_chars].rsplit(".", 1)[0] + ".") if len(text) > max_chars else text
        meta = d.get("meta", {})
        evidences.append({
            "title": meta.get("scheme_name") or meta.get("source") or "Document",
            "snippet": snippet,
            "url": meta.get("url") or "No official URL provided"
        })
    return evidences


# --- Generate data-driven actions dynamically ---
def _generate_actions(insights, user_profile):
    actions = []
    avg = insights.get("avg_invoice", 0)
    total = insights.get("total_sales", 0)
    top_sku = insights.get("top_sku", {})
    turnover = user_profile.get("turnover", 0)

    if avg < 5000:
        actions.append("Bundle small orders or set a minimum order value to improve average invoice size.")
    if top_sku and top_sku.get("margin", 0) >= 20:
        actions.append(f"Promote your top SKU '{top_sku.get('name')}' (margin {top_sku.get('margin')}%) through WhatsApp campaigns.")
    if total < 100000 and turnover < 3000000:
        actions.append("Apply for a working capital scheme to stabilize cash flow and fund inventory.")
    if turnover > 2000000:
        actions.append("Evaluate supplier contracts to negotiate better rates on bulk materials.")
    if not actions:
        actions.append("Focus on improving SKU margins and optimizing stock turnover.")

    return actions


# --- Main advisor logic ---
def answer_query(user_profile, user_snapshot, query, use_gemini=False):
    docs = _retrieve_docs(query, n_results=5)
    insights = _compute_snapshot_insights(user_snapshot)

    summary = f"Recent sales snapshot: ₹{insights['total_sales']:.0f} from {insights['invoice_count']} invoices."
    if insights['top_sku']:
        summary += f" Top SKU: {insights['top_sku'].get('name','N/A')} (margin {insights['top_sku'].get('margin','N/A')}%)."

    rationale = " ".join(d["text"] for d in docs[:2]) if docs else "No relevant schemes or documents retrieved."

    actions = _generate_actions(insights, user_profile)
    evidence = _format_evidence(docs)

    base_resp = {
        "summary": summary,
        "rationale": rationale,
        "actions": actions,
        "evidence": evidence,
        "query": query
    }

    if use_gemini:
        refined = _ask_gemini(base_resp)
        if refined:
            base_resp["gemini_answer"] = refined

    return base_resp


# --- Gemini refinement (safe) ---
def _ask_gemini(resp):
    api_key = os.getenv("AIzaSyDQY8c4mZ0W-SGSKsGL5YFbV3EmLNTE6Qk")
    if not api_key:
        print("[WARN] GEMINI_API_KEY not found — skipping Gemini reasoning.")
        return None

    # Create a compact, strict prompt
    evidence_block = "\n".join(
        [f"{i+1}. {e['title']} — {e['snippet']} (URL: {e['url']})"
         for i, e in enumerate(resp.get("evidence", []))]
    )

    prompt = f"""
You are an MSME financial advisor. 
Use only the provided structured data and evidence. 
Do NOT invent new facts, figures, or URLs.

Structured Summary:
{resp['summary']}

Rationale from docs:
{resp['rationale']}

Evidence:
{evidence_block}

User Query: {resp['query']}

TASK:
1. Write a short paragraph (4–6 lines) giving clear, data-driven business advice. 
2. Use actual numbers (sales, invoices, margins) where possible.
3. Mention one relevant scheme only from the evidence section.
4. At the end, cite sources exactly as provided (do not add or fabricate).

Tone: Professional, realistic, supportive.
Return only the paragraph text.
"""

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText?key={api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        r = requests.post(url, headers=headers, json=payload, timeout=20)

        if r.status_code == 200:
            text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
            return text.strip()
        else:
            print(f"[Gemini Error] {r.status_code}: {r.text}")
    except Exception as e:
        print(f"[Gemini Exception] {e}")
    return None


# --- Test ---
if __name__ == "__main__":
    up = {"turnover": 2500000, "employees": 10, "industry": "manufacturing", "location": "Karnataka"}
    snapshot = {
        "invoices": [{"amount": 3000}, {"amount": 4000}, {"amount": 5000}],
        "top_sku": {"name": "Widget A", "margin": 22.5, "sales": 5000}
    }

    print(json.dumps(answer_query(up, snapshot, "How can I increase profit next month?", use_gemini=True), indent=2))
