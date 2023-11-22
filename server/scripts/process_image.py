import tensorflow as tf
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.keras.preprocessing import image
import numpy as np
import sys
import json

# Load the pre-trained ResNet50 model
model = ResNet50(weights='imagenet', include_top=False)


def extract_features(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    features = model.predict(img_array)
    return features.flatten()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        img_path = sys.argv[1]
        features = extract_features(img_path)

        # Convert features to a list and print as JSON
        print(json.dumps(features.tolist()))
    else:
        print("Error: No image path provided", file=sys.stderr)
        sys.exit(1)
