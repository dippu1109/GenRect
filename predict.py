import tensorflow as tf
import numpy as np
import cv2

model = tf.keras.models.load_model("genrect_model.h5")

def predict_image(img_path):
    img = cv2.imread(img_path)
    img = cv2.resize(img, (224,224))
    img = img / 255.0
    img = np.reshape(img, (1,224,224,3))

    pred = model.predict(img)[0][0]

    if pred > 0.5:
        print(f"FAKE ({pred*100:.2f}%)")
    else:
        print(f"REAL ({(1-pred)*100:.2f}%)")

# Test with any image
predict_image("test.jpg")