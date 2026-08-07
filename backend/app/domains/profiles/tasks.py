import os
from celery import shared_task
from PIL import Image

@shared_task(name="app.domains.profiles.tasks.generate_profile_thumbnail")
def generate_profile_thumbnail(image_path: str, size: int = 150) -> str:
    if not os.path.exists(image_path):
        return ""
    
    dir_name, file_name = os.path.split(image_path)
    thumb_filename = f"thumb_{file_name}"
    thumb_path = os.path.join(dir_name, thumb_filename)

    try:
        with Image.open(image_path) as img:
            img.thumbnail((size, size))
            img.save(thumb_path)
        return thumb_path
    except Exception as e:
        print(f"Error generating thumbnail: {e}")
        return image_path
