# user-service/main.py
from fastapi import FastAPI, Depends, HTTPException, status # type: ignore
from fastapi.security import OAuth2PasswordRequestForm # type: ignore
from sqlalchemy.orm import Session # type: ignore
from datetime import timedelta

# Import shared components
from shared.database import get_db, Base, get_engine
from shared.models import User, Cart # Cart is needed for creating a cart on user registration
from shared.schemas import UserCreate, UserResponse, Token
from shared.security import verify_password, get_password_hash, create_access_token, get_current_user
from shared.config import ACCESS_TOKEN_EXPIRE_MINUTES, DATABASE_URL

app = FastAPI(
    title="User Service",
    description="Handles user registration and authentication.",
    version="1.0.0",
    root_path="/users" # This is important for the Nginx proxy routing
)

# Custom dependency for the user service's database connection
def get_user_db():
    yield from get_db(DATABASE_URL)

@app.on_event("startup")
async def startup_event():
    engine = get_engine(DATABASE_URL)
    # This creates tables if they don't exist.
    # In a production setup, use Alembic for migrations.
    Base.metadata.create_all(bind=engine)
    print("User service database tables checked/created.")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_user_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create an empty cart for the new user
    # In a very strict microservices pattern, this would be an event (e.g., UserCreated)
    # sent to a message queue, and the Cart service would consume it.
    # For simplicity and direct porting, we keep it here for now.
    new_cart = Cart(user_id=new_user.id)
    db.add(new_cart)
    db.commit()
    db.refresh(new_cart)

    return new_user

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_user_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
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
def read_users_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_user_db)):
    # get_current_user uses the db_session from get_user_db here, not the default get_db
    return current_user