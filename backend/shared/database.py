import asyncio # For asynchronous sleep in retry logic
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker # type: ignore # Import async SQLAlchemy components
from sqlalchemy.orm import declarative_base # type: ignore # For Base
from sqlalchemy import text # type: ignore # For simple query to test connection

# Base needs to be defined in one central place and imported by models
# It's good practice to import declarative_base directly from sqlalchemy.orm as of SQLAlchemy 2.0
Base = declarative_base()

# Function to get the SQLAlchemy AsyncEngine
async def get_engine(db_url: str):
    """
    Attempts to connect to the database asynchronously with retries.
    """
    max_retries = 10
    retry_interval = 5 # seconds
    engine = None # Initialize engine outside the loop

    for i in range(max_retries):
        try:
            # Create the async engine
            engine = create_async_engine(db_url, echo=False) # 'echo=True' for debugging SQL

            # Test connection asynchronously by executing a simple query
            async with engine.connect() as conn:
                await conn.scalar(text("SELECT 1")) # Executes a trivial query to verify connection
            print(f"Database connection successful after {i+1} attempts.")
            return engine
        except Exception as e:
            print(f"Database connection failed (attempt {i+1}/{max_retries}): {e}")
            if i < max_retries - 1:
                await asyncio.sleep(retry_interval) # Use asyncio.sleep for non-blocking delay
            else:
                # Re-raise if max retries reached, indicating persistent connection issue
                raise ConnectionRefusedError(f"Failed to connect to database after {max_retries} attempts: {e}")
    return None # This line should theoretically not be reached if exceptions are handled

# Function to get a configured AsyncSessionLocal class
def get_session_local(engine_obj):
    """
    Returns an async_sessionmaker configured to produce AsyncSession instances.
    """
    return async_sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine_obj,
        class_=AsyncSession, # Specify AsyncSession
        expire_on_commit=False,
    )

# Dependency to get the DB session for FastAPI endpoints
async def get_db(db_url: str):
    """
    FastAPI dependency that provides an asynchronous database session.
    Manages session lifecycle (creation and closing).
    """
    engine = await get_engine(db_url) # Await the asynchronous get_engine function
    if not engine:
        # If get_engine didn't return an engine after retries, raise an error
        raise ConnectionRefusedError("Could not obtain a database engine.")

    SessionLocal = get_session_local(engine)
    async with SessionLocal() as db: # Use 'async with' for AsyncSession
        try:
            yield db
        finally:
            await db.close() # Ensure the async session is properly closed