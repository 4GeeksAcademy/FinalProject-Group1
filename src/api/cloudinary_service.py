import cloudinary
import cloudinary.uploader as uploader
import os


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

cloudinary_service = CloudinaryService()