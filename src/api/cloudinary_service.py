import cloudinary
import cloudinary.uploader as uploader
import os
import cloudinary.api as api
from urllib.parse import urlparse


class CloudinaryService:
    def __init__(self):
        cloudinary.config( 
            cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
            api_key = os.getenv("CLOUDINARY_API_KEY"), 
            api_secret = os.getenv("CLOUDINARY_API_SECRET") 
        )

    def upload_image(self, file_data, folder_name="recipe_images"):
        try:
            upload_result = uploader.upload(
                file_data, 
                folder=folder_name, 
                resource_type="auto"
            )
            return upload_result['secure_url']
        
        except Exception as error:
            print(f"Cloudinary Upload Error: {error}")
            raise Exception("Error uploading image. Please verify your Cloudinary credentials.")
        

    def delete_image(self, image_url: str):
        if not image_url:
            return True 

        try:
            parsed_url = urlparse(image_url)
            path = parsed_url.path 

            parts = path.split('/upload/')
            if len(parts) < 2:

                print("Cloudinary Delete Error: URL inválida o no contiene /upload/.")
                return False 
            

            version_and_id = parts[1]
            
            public_id_with_extension = "/".join(version_and_id.split('/')[1:])

            public_id = os.path.splitext(public_id_with_extension)[0]

            result = api.destroy(public_id)

            if result.get("result") not in ["ok", "not found"]:
                raise Exception(f"Cloudinary returned status: {result.get('result')}")

            return True

        except Exception as error:

            print(f"Cloudinary Delete Error: Failed to delete {image_url}. Detalles: {error}")
            return False

cloudinary_service = CloudinaryService()