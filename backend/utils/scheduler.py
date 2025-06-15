import asyncio
import os
from typing import Callable, Optional, List
import logging

logger = logging.getLogger(__name__)

# for demo purpose, we'll use scheduler rather than third party persistent database
async def delete_user_file_later(user_id: int, file_path: str, delay: int = 900, document_ids: Optional[List[str]] = None, callback: Optional[Callable[[List[str], int], None]] = None):
    await asyncio.sleep(delay)

    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted {file_path} for user {user_id}")

        if callback:
            callback(document_ids, user_id)
    except Exception as e:
        logger.error(f"Error removing file : {e} for user {user_id}")        
        raise e
        
