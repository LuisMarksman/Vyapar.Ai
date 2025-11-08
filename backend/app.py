from flask import Flask, request, jsonify
from ai_engine import parse_receipt, match_schemes, answer_query

app = Flask(__name__)

@app.route('/upload_receipt', methods=['POST'])
def upload_receipt():
    f = request.files.get('file')
    if not f:
        return jsonify({'error': 'file required'}), 400
    return jsonify(parse_receipt(f.read()))

@app.route('/schemes/match', methods=['POST'])
def schemes_match():
    data = request.json or {}
    return jsonify(match_schemes(data))

@app.route('/ask', methods=['POST'])
def ask():
    body = request.json or {}
    return jsonify(answer_query(
        body.get('user_profile', {}),
        body.get('user_snapshot', {}),
        body.get('query', '')
    ))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
