import unittest
from ai_engine import parse_receipt, match_schemes, answer_query

class QuickTests(unittest.TestCase):
    def test_scheme_match_basic(self):
        up = {'turnover': 1000000, 'employees': 5, 'industry': 'services', 'location': 'Karnataka'}
        matches = match_schemes(up)
        self.assertIsInstance(matches, list)
        self.assertTrue(len(matches) <= 3)

    def test_answer_query_format(self):
        up = {'turnover': 2000000, 'employees': 10, 'industry': 'manufacturing'}
        snap = {'invoices': [{'amount':1000}], 'top_sku': {'name':'A','margin':20}}
        resp = answer_query(up, snap, 'increase profit')
        self.assertIn('summary', resp)
        self.assertIn('actions', resp)
        self.assertTrue(len(resp['actions']) >= 2)

if __name__ == '__main__':
    unittest.main()
