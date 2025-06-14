from fastapi import HTTPException, status
from typing import IO
import filetype

def validate_file(file: IO) -> None:
    FILE_SIZE = 5242880  # 5 MB

    accepted_file_types = ["pdf"] # you can add more

    file_info = filetype.guess(file.file)
    
    if file_info is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unable to determine file type"
        )
    
    detected_content_type = file_info.extension.lower()
    print("Detect content type : ", detected_content_type)
    print("File content type : ", file.content_type)

    if (detected_content_type not in accepted_file_types):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type",
        )
    
    real_file_size = 0
    for chunk in file.file:
        real_file_size += len(chunk)
        if real_file_size > FILE_SIZE:
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Too large")
        
    file.file.seek(0)