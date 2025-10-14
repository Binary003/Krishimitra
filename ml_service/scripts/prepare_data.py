import os
import zipfile
from kaggle.api.kaggle_api_extended import KaggleApi
import shutil

# Authenticate Kaggle API
api = KaggleApi()
api.authenticate()

# Define paths
zip_path = 'new-plant-diseases-dataset.zip'
target_dir = os.path.join('data', 'Plantvillage', 'New Plant Diseases Dataset(Augmented)', 'New Plant Diseases Dataset(Augmented)')
temp_extract_dir = os.path.join('data', 'temp')

# Download or use existing ZIP
if not os.path.exists(zip_path):
    print("Downloading dataset...")
    api.dataset_download_files('vipoooool/new-plant-diseases-dataset', path='.', unzip=False)
    if not os.path.exists(zip_path):
        raise FileNotFoundError("Download failed. Check Kaggle API configuration.")
else:
    print("Zip file found. Proceeding with extraction.")

# Remove existing target directory to avoid conflicts
if os.path.exists(target_dir):
    shutil.rmtree(target_dir)
    print(f"Removed existing {target_dir} to ensure fresh extraction.")

# Create target directory
print(f"Creating target directory: {target_dir}")
os.makedirs(target_dir, exist_ok=True)

# Extract to temp directory
print(f"Extracting to temp directory: {temp_extract_dir}")
os.makedirs(temp_extract_dir, exist_ok=True)
try:
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(temp_extract_dir)
    print("Extraction completed.")
except zipfile.BadZipFile:
    print("Error: ZIP file is corrupted. Please re-download.")
    raise
except Exception as e:
    print(f"Extraction failed: {e}")
    raise

# Flatten nested structure if present
nested_dir = os.path.join(temp_extract_dir, 'New Plant Diseases Dataset(Augmented)', 'New Plant Diseases Dataset(Augmented)')
if os.path.exists(nested_dir):
    print("Flattening nested structure...")
    for item in os.listdir(nested_dir):
        src = os.path.join(nested_dir, item)
        dst = os.path.join(temp_extract_dir, item)
        if os.path.exists(dst):
            if os.path.isdir(dst):
                shutil.rmtree(dst)
            else:
                os.remove(dst)
        shutil.move(src, temp_extract_dir)
    os.rmdir(os.path.join(temp_extract_dir, 'New Plant Diseases Dataset(Augmented)'))
else:
    print("No additional nesting found. Using extracted contents.")

# Move final contents to target_dir
print(f"Moving contents to {target_dir}...")
for item in os.listdir(temp_extract_dir):
    src = os.path.join(temp_extract_dir, item)
    dst = os.path.join(target_dir, item)
    if os.path.exists(dst):
        if os.path.isdir(dst):
            shutil.rmtree(dst)
        else:
            os.remove(dst)
    shutil.move(src, dst)

# Clean up temp
os.rmdir(temp_extract_dir)

# Remove zip file to save space
if os.path.exists(zip_path):
    os.remove(zip_path)
    print("Removed ZIP file.")

print(f"Dataset prepared in {target_dir}")
print("Train contents:", os.listdir(os.path.join(target_dir, 'train')))