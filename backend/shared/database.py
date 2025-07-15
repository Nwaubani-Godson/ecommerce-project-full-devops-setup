from sqlalchemy import create_engine # type: ignore
from sqlalchemy.orm import sessionmaker, Session # type: ignore
from sqlalchemy.ext.declarative import declarative_base # type: ignore
import time # For retries

# Base needs to be defined in one central place and imported by models
Base = declarative_base()

# Function to get the SQLAlchemy Engine
def get_engine(db_url: str):
    # This retries connecting to the database, useful during container startup
    max_retries = 10
    retry_interval = 5 # seconds
    for i in range(max_retries):
        try:
            engine = create_engine(db_url)
            # Try to connect to prove it's working
            with engine.connect():
                print(f"Database connection successful after {i+1} attempts.")
            return engine
        except Exception as e:
            print(f"Database connection failed (attempt {i+1}/{max_retries}): {e}")
            if i < max_retries - 1:
                time.sleep(retry_interval)
            else:
                raise # Re-raise if max retries reached
    return None # Should not be reached

# Function to get a configured SessionLocal class
def get_session_local(engine_obj):
    return sessionmaker(autocommit=False, autoflush=False, bind=engine_obj)

# Dependency to get the DB session for FastAPI endpoints
def get_db(db_url: str):
    engine = get_engine(db_url)
    SessionLocal = get_session_local(engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()