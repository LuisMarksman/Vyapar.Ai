import json
import os
from pathlib import Path
import sys

ROOT = Path(__file__).parents[2]
sys.path.insert(0, str(ROOT / 'backend'))

from ai_engine import parse_receipt, match_schemes, answer_query

SAMPLE_RECEIPT = str(ROOT / 'backend' / 'sample_receipt.jpg')

user_profile = {
    'turnover': 2500000,
    'employees': 10,
    'industry': 'manufacturing',
    'location': 'Karnataka'
}

user_snapshot = {
    'invoices': [
        {'amount': 1200, 'date': '2025-10-01'},
        {'amount': 800, 'date': '2025-10-03'},
        {'amount': 5000, 'date': '2025-10-10'}
    ],
    'top_sku': {'name': 'Widget A', 'margin': 22.5, 'sales': 15000}
}

def run_demo():
    print('== Parse receipt ==')
    if os.path.exists(SAMPLE_RECEIPT):
        with open(SAMPLE_RECEIPT, 'rb') as f:
            res = parse_receipt(f.read())
    else:
        print(f"No sample receipt at {SAMPLE_RECEIPT}. Using dummy parse result.")
        res = {'vendor': 'Demo Vendor', 'date': '2025-11-01', 'amount': 1250.0, 'category_guess': 'Grocery', 'raw_text': ''}
    print(json.dumps(res, indent=2, ensure_ascii=False))

    print('\n== Match schemes ==')
    matches = match_schemes(user_profile)
    print(json.dumps(matches, indent=2, ensure_ascii=False))

    print('\n== Ask AI Advisor ==')
    ans = answer_query(user_profile, user_snapshot, 'How can I increase profit next month?')
    print(json.dumps(ans, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    run_demo()
