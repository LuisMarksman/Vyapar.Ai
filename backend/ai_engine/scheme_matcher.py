import json
import os
from sentence_transformers import SentenceTransformer, util
import numpy as np

MODEL_NAME = "all-MiniLM-L6-v2"
_model = None
_SCHEMES = None

def _ensure_model_and_schemes():
    global _model, _SCHEMES
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    if _SCHEMES is None:
        path = os.path.join(os.path.dirname(__file__), '..', 'schemes.json')
        with open(path, 'r', encoding='utf-8') as f:
            _SCHEMES = json.load(f)
    return _model, _SCHEMES

def rule_based_filter(user_profile, schemes):
    candidates = []
    for s in schemes:
        ok = True
        if user_profile.get('turnover') is not None and s.get('eligible_turnover_max') is not None:
            if user_profile.get('turnover') > s.get('eligible_turnover_max'):
                ok = False
        if user_profile.get('employees') is not None and s.get('eligible_employees_max') is not None:
            if user_profile.get('employees') > s.get('eligible_employees_max'):
                ok = False
        if ok:
            candidates.append(s)
    return candidates

def semantic_rank(user_profile, candidates, top_k=3):
    model, _ = _ensure_model_and_schemes()
    user_text = f"Turnover {user_profile.get('turnover','N/A')} employees {user_profile.get('employees','N/A')} industry {user_profile.get('industry','N/A')} location {user_profile.get('location','N/A')}"
    u_emb = model.encode(user_text, convert_to_tensor=True)
    cand_texts = [c.get('description','') + ' ' + ' '.join(c.get('industry_tags', [])) for c in candidates]
    if not cand_texts:
        return []
    cand_embs = model.encode(cand_texts, convert_to_tensor=True)
    scores = util.cos_sim(u_emb, cand_embs).cpu().numpy()[0]
    ranked_idx = np.argsort(-scores)[:top_k]
    matches = []
    for idx in ranked_idx:
        s = candidates[idx]
        score = float(scores[idx])
        why = []
        if user_profile.get('industry') in s.get('industry_tags', []):
            why.append('industry tag match')
        if user_profile.get('turnover') is not None and s.get('eligible_turnover_max') is not None and user_profile.get('turnover') <= s.get('eligible_turnover_max'):
            why.append('turnover within limit')
        if user_profile.get('employees') is not None and s.get('eligible_employees_max') is not None and user_profile.get('employees') <= s.get('eligible_employees_max'):
            why.append('employee count within limit')
        matches.append({
            'id': s.get('id'),
            'name': s.get('name'),
            'match_score': round(score, 4),
            'why': '; '.join(why) if why else 'semantic match fallback',
            'docs_required': s.get('docs_required', []),
            'url': s.get('url')
        })
    return matches

def match_schemes(user_profile):
    model, schemes = _ensure_model_and_schemes()
    candidates = rule_based_filter(user_profile, schemes)
    if not candidates:
        candidates = schemes
    return semantic_rank(user_profile, candidates, top_k=3)

if __name__ == "__main__":
    demo = {'turnover': 2500000, 'employees': 10, 'industry': 'manufacturing', 'location': 'Karnataka'}
    print(match_schemes(demo))
