import os
from dotenv import load_dotenv # type: ignore
from datetime import timedelta

load_dotenv() # Load environment variables from .env file

DATABASE_URL = os.environ["DATABASE_URL"]
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30