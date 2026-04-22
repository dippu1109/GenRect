import streamlit as st
import tensorflow as tf
import numpy as np
import cv2
from PIL import Image

# Load model
model = tf.keras.models.load_model("genrect_model.h5")

# Page config
st.set_page_config(page_title="GenRect", layout="wide")

# --------- CUSTOM STYLING ---------
st.markdown("""
<style>
body {
    background-color: #f5f7fa;
}
.header {
    font-size: 42px;
    font-weight: 700;
    color: #1f2c3c;
}
.subheader {
    font-size: 18px;
    color: #6c757d;
    margin-bottom: 20px;
}
.card {
    background-color: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0px 4px 12px rgba(0,0,0,0.05);
}
.result {
    font-size: 26px;
    font-weight: 600;
}
.confidence {
    font-size: 16px;
    color: #555;
}
</style>
""", unsafe_allow_html=True)

# --------- HEADER ---------
st.markdown('<div class="header">GenRect</div>', unsafe_allow_html=True)
st.markdown('<div class="subheader">AI-Based Image Authenticity Detection System</div>', unsafe_allow_html=True)

st.write("")

# --------- MAIN LAYOUT ---------
col1, col2 = st.columns([1, 1])

# --------- LEFT PANEL ---------
with col1:
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.subheader("Upload Image")
    uploaded_file = st.file_uploader("", type=["jpg", "jpeg", "png"])

    if uploaded_file:
        image = Image.open(uploaded_file)
        st.image(image, caption="Input Image", use_column_width=True)

    st.markdown('</div>', unsafe_allow_html=True)

# --------- RIGHT PANEL ---------
with col2:
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.subheader("Analysis Result")

    if uploaded_file:
        # Preprocess
        img = np.array(image)
        img = cv2.resize(img, (224, 224)) / 255.0
        img = np.reshape(img, (1, 224, 224, 3))

        # Predict
        pred = model.predict(img)[0][0]

        if pred > 0.5:
            st.markdown('<div class="result" style="color:#c0392b;">Fake Image</div>', unsafe_allow_html=True)
            st.markdown(f'<div class="confidence">Confidence: {pred*100:.2f}%</div>', unsafe_allow_html=True)
        else:
            st.markdown('<div class="result" style="color:#1e8449;">Real Image</div>', unsafe_allow_html=True)
            st.markdown(f'<div class="confidence">Confidence: {(1-pred)*100:.2f}%</div>', unsafe_allow_html=True)

    else:
        st.write("Upload an image to view results.")

    st.markdown('</div>', unsafe_allow_html=True)

# --------- FOOTER ---------
st.write("")
st.markdown("---")
st.markdown(
    "<div style='text-align:center; color:#888;'>GenRect • AI Detection System</div>",
    unsafe_allow_html=True
)