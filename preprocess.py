from PIL import Image
import os
import random

folders = [
    "datasets/train/real",
    "datasets/train/fake",
    "datasets/val/real",
    "datasets/val/fake"
]

# 1. Remove corrupt images
def clean(folder):
    removed = 0
    for file in os.listdir(folder):
        path = os.path.join(folder, file)
        try:
            img = Image.open(path)
            img.verify()
        except:
            os.remove(path)
            removed += 1
    print(f"{folder}: removed {removed} corrupt images")

# 2. Limit dataset size (optional)
def limit(folder, max_files=800):
    files = os.listdir(folder)
    random.shuffle(files)
    
    for f in files[max_files:]:
        os.remove(os.path.join(folder, f))
    
    print(f"{folder}: limited to {max_files} images")

# Run cleaning
for f in folders:
    clean(f)

# Run limiting (optional for laptop)
for f in folders:
    limit(f, max_files=800)

print("✅ Preprocessing Done!")