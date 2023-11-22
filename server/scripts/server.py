from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import tensorflow as tf
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.keras.preprocessing import image
import numpy as np
import os
import sys

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load the pre-trained ResNet50 model
model = ResNet50(weights='imagenet', include_top=False)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_features(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    features = model.predict(img_array)
    return features.flatten()

@app.route('/upload', methods=['POST'])
def upload_file():
    print('Request received', file=sys.stderr)
    if 'image' not in request.files:
        print('File not in request')
        return jsonify({'error': 'No image part'}), 400
    
    file = request.files['image']
    print('File received', file=sys.stderr)

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    print('File name: ' + file.filename, file=sys.stderr)
    
    if file and allowed_file(file.filename):
        print('File allowed', file=sys.stderr)
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        features = extract_features(file_path)
        return jsonify({'features': features.tolist()})
    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
