import os
import io
import base64
import ollama
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

app = Flask(__name__)
CORS(app)  # Allow mobile app to connect

MODEL_NAME = "qwen3-vl:8b"

@app.route('/', methods=['GET'])
def health_check():
    return "Vision AI Server is Running! 🚀"

@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    image_bytes = file.read()
    
    # Save temp for debugging (optional)
    # with open("last_received.jpg", "wb") as f:
    #     f.write(image_bytes)

    print("📸 Image received, analyzing with AI...")

    try:
        response = ollama.chat(
            model=MODEL_NAME,
            messages=[{
                'role': 'user',
                'content': "Read the digital number on this display. Return ONLY the number. If unsure, say '0'.",
                'images': [image_bytes]
            }]
        )
        
        result_text = response['message']['content'].strip()
        print(f"🤖 AI Result: {result_text}")
        
        return jsonify({
            "status": "success",
            "result": result_text
        })

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    # Listen on all interfaces so mobile can connect
    app.run(host='0.0.0.0', port=5000, debug=True)
