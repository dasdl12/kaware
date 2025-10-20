from PIL import Image
import img2pdf

image_path = "image.png"
pdf_path = "output.pdf"

with open(pdf_path, "wb") as f:
    f.write(img2pdf.convert(image_path))