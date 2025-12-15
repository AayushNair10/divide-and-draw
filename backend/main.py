# divide and draw/backend/main.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from io import BytesIO
import base64
from PIL import Image

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ---------- Utility helpers ----------

def pil_from_bytes(image_bytes):
    return Image.open(BytesIO(image_bytes)).convert("RGB")

def image_bytes_from_cv2(img_cv2):
    success, buffer = cv2.imencode('.png', img_cv2)
    if not success:
        raise RuntimeError("Failed to encode image to PNG")
    return buffer.tobytes()

def to_data_url(img_bytes, mime="image/png"):
    b64 = base64.b64encode(img_bytes).decode("utf-8")
    return f"data:{mime};base64,{b64}"

# ---------- Sketch conversion ----------

def convert_to_sketch(image_bytes, max_size=800):
    """Convert image to a clean sketch using OpenCV. Returns PNG bytes."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")

    # Resize keeping aspect ratio
    h, w = img.shape[:2]
    if max(h, w) > max_size:
        if w >= h:
            new_w = max_size
            new_h = int(h * (max_size / w))
        else:
            new_h = max_size
            new_w = int(w * (max_size / h))
        img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Reduce noise while keeping edges
    gray = cv2.bilateralFilter(gray, 9, 75, 75)

    # CLAHE for contrast
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)

    # Contrast boost
    gray = cv2.convertScaleAbs(gray, alpha=1.3, beta=10)

    # Edge detection
    edges = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_MEAN_C,
        cv2.THRESH_BINARY,
        blockSize=9,
        C=5
    )

    # Morphological closing
    kernel = np.ones((2, 2), np.uint8)
    edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)

    # Median blur to remove speckles
    edges = cv2.medianBlur(edges, 3)

    return image_bytes_from_cv2(edges)

# ---------- Accuracy evaluation ----------

def to_binary_edge(img_bytes, max_size=800):
    """Convert image to binary edge representation."""
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")
    
    h, w = img.shape[:2]
    if max(h, w) > max_size:
        if w >= h:
            new_w = max_size
            new_h = int(h * (max_size / w))
        else:
            new_h = max_size
            new_w = int(w * (max_size / h))
        img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.adaptiveThreshold(
        gray, 255, 
        cv2.ADAPTIVE_THRESH_MEAN_C, 
        cv2.THRESH_BINARY, 
        9, 5
    )
    edges = cv2.medianBlur(edges, 3)
    return edges

def compute_accuracy_metrics(original_bytes, user_bytes):
    """
    Compute accuracy metrics between original and user drawings.
    Returns coverage_percent and iou_percent (0-100).
    """
    orig_bin = to_binary_edge(original_bytes)
    user_bin = to_binary_edge(user_bytes)

    # Ensure same shape
    if orig_bin.shape != user_bin.shape:
        user_bin = cv2.resize(
            user_bin, 
            (orig_bin.shape[1], orig_bin.shape[0]), 
            interpolation=cv2.INTER_NEAREST
        )

    # Black pixels (strokes) are 0, white is 255
    orig_black = orig_bin == 0
    user_black = user_bin == 0

    intersection = np.logical_and(orig_black, user_black).sum()
    union = np.logical_or(orig_black, user_black).sum()
    orig_count = orig_black.sum()

    coverage_percent = (
        float(intersection) / float(orig_count) * 100.0 
        if orig_count > 0 else 0.0
    )
    iou_percent = (
        float(intersection) / float(union) * 100.0 
        if union > 0 else 0.0
    )

    # Clip to 0-100
    coverage_percent = max(0.0, min(100.0, coverage_percent))
    iou_percent = max(0.0, min(100.0, iou_percent))

    return coverage_percent, iou_percent

# ---------- Flask endpoints ----------

@app.route('/convert', methods=['POST'])
def convert():
    """Convert uploaded image to sketch and return base64 data URL."""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        image_bytes = image_file.read()
        sketch_bytes = convert_to_sketch(image_bytes)
        sketch_b64 = to_data_url(sketch_bytes, mime="image/png")
        
        return jsonify({
            'success': True, 
            'sketch': sketch_b64
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/evaluate', methods=['POST'])
def evaluate():
    """
    Evaluate user sketch vs original sketch.
    Accepts either multipart files or JSON with base64 images.
    Returns coverage_percent, iou_percent, and visualization.
    """
    try:
        original_bytes = None
        user_bytes = None

        # Try multipart files first
        if 'original_sketch' in request.files:
            original_bytes = request.files['original_sketch'].read()
        if 'user_sketch' in request.files:
            user_bytes = request.files['user_sketch'].read()

        # Try JSON if files not provided
        if request.is_json:
            j = request.get_json()
            
            if not original_bytes and 'original' in j:
                original_b64 = j['original']
                original_bytes = base64.b64decode(
                    original_b64.split(",")[-1] 
                    if original_b64.startswith("data:") 
                    else original_b64
                )
            
            if not user_bytes and 'user' in j:
                user_b64 = j['user']
                user_bytes = base64.b64decode(
                    user_b64.split(",")[-1] 
                    if user_b64.startswith("data:") 
                    else user_b64
                )

        if original_bytes is None or user_bytes is None:
            return jsonify({
                'error': 'Both original_sketch and user_sketch required'
            }), 400

        # Compute metrics
        coverage, iou = compute_accuracy_metrics(original_bytes, user_bytes)

        # Create visualization overlay
        orig_bin = to_binary_edge(original_bytes)
        user_bin = to_binary_edge(user_bytes)
        
        if orig_bin.shape != user_bin.shape:
            user_bin = cv2.resize(
                user_bin, 
                (orig_bin.shape[1], orig_bin.shape[0]), 
                interpolation=cv2.INTER_NEAREST
            )

        # Create RGB visualization (original in gray, user strokes in red)
        vis = cv2.cvtColor(orig_bin, cv2.COLOR_GRAY2BGR)
        mask_user = (user_bin == 0)
        vis[mask_user] = [0, 0, 255]  # BGR red

        vis_bytes = image_bytes_from_cv2(vis)
        vis_b64 = to_data_url(vis_bytes, mime="image/png")

        return jsonify({
            'success': True,
            'coverage_percent': round(coverage, 2),
            'iou_percent': round(iou, 2),
            'visualization': vis_b64
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def index():
    return jsonify({'message': 'Divide & Draw backend running'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)