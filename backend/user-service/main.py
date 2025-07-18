from fastapi import FastAPI, Depends, HTTPException, status # type: ignore
from fastapi.security import OAuth2PasswordRequestForm # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession # type: ignore # Import AsyncSession
from sqlalchemy import select # type: ignore # Import select for async ORM queries
from datetime import timedelta

# Import shared components
from shared.database import get_db, Base, get_engine # get_db and get_engine are now async
from shared.models import User, Cart # Cart is needed for creating a cart on user registration
from shared.schemas import UserCreate, UserResponse, Token
from shared.security import verify_password, get_password_hash, create_access_token, get_current_user # get_current_user might also need async updates depending on its implementation
from shared.config import ACCESS_TOKEN_EXPIRE_MINUTES, DATABASE_URL

app = FastAPI(
    title="User Service",
    description="Handles user registration and authentication.",
    version="1.0.0",
    root_path="/users" # This is important for the Nginx proxy routing
)

# Custom dependency for the user service's asynchronous database connection
async def get_user_db():
    # Await the asynchronous get_db from shared.database
    async for session in get_db(DATABASE_URL):
        yield session

@app.on_event("startup") # Deprecated, but keeping for now as it's in your original structure
async def startup_event():
    # Ensure the engine is created asynchronously
    engine = await get_engine(DATABASE_URL)
    # This creates tables if they don't exist.
    # In a production setup, use Alembic for migrations.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all) # Run synchronous create_all within async context
    print("User service database tables checked/created.")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user: UserCreate,
    db: AsyncSession = Depends(get_user_db) # Type hint with AsyncSession
):
    # Check if username already registered asynchronously
    db_user_username_result = await db.execute(select(User).filter(User.username == user.username))
    db_user = db_user_username_result.scalar_one_or_none()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    
    # Check if email already registered asynchronously
    db_user_email_result = await db.execute(select(User).filter(User.email == user.email))
    db_user = db_user_email_result.scalar_one_or_none()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    await db.commit() # Await commit
    await db.refresh(new_user) # Await refresh

    # Create an empty cart for the new user asynchronously
    new_cart = Cart(user_id=new_user.id)
    db.add(new_cart)
    await db.commit() # Await commit
    await db.refresh(new_cart) # Await refresh

    return new_user

@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_user_db) # Type hint with AsyncSession
):
    # Fetch user asynchronously
    user_result = await db.execute(select(User).filter(User.username == form_data.username))
    user = user_result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db) # Type hint with AsyncSession
):
    # get_current_user typically fetches the user based on the token.
    # Its implementation in shared/security.py should also be updated to be async
    # and use AsyncSession if it performs DB lookups.
    return current_user