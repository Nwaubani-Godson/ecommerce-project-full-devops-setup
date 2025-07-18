from typing import List
from fastapi import FastAPI, Depends, HTTPException, status # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession # type: ignore # Import AsyncSession
from sqlalchemy import select # type: ignore # Import select for async ORM queries
from sqlalchemy.sql import func # type: ignore # For timestamps

# Import shared components
from shared.database import get_db, Base, get_engine # get_db and get_engine are now async
from shared.models import Product, User # User is needed for get_current_user
from shared.schemas import ProductCreate, ProductUpdate, ProductResponse
from shared.security import get_current_user
from shared.config import DATABASE_URL

app = FastAPI(
    title="Product Service",
    description="Manages product catalog operations.",
    version="1.0.0",
    root_path="/products" # This is important for the Nginx proxy routing
)

# Custom dependency for the product service's asynchronous database connection
async def get_product_db():
    # Await the asynchronous get_db from shared.database
    async for session in get_db(DATABASE_URL):
        yield session

@app.on_event("startup") # Deprecated, but keeping for now as it's in your original structure
async def startup_event():
    # Ensure the engine is created asynchronously
    engine = await get_engine(DATABASE_URL)
    # This creates tables if they don't exist. For production, migrations (e.g., Alembic) are preferred.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Product service database tables checked/created.")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    db: AsyncSession = Depends(get_product_db), # Type hint with AsyncSession
    current_user: User = Depends(get_current_user)
):
    # For simplicity, allowing any logged-in user to create products.
    # In a real app, you'd add admin/seller roles and checks here.
    db_product = Product(**product.dict())
    db.add(db_product)
    await db.commit() # Await commit
    await db.refresh(db_product) # Await refresh
    return db_product

@app.get("/", response_model=List[ProductResponse])
async def read_products(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_product_db) # Type hint with AsyncSession
):
    products_result = await db.execute(select(Product).offset(skip).limit(limit))
    products = products_result.scalars().all() # Use scalars().all() for multiple results
    return products

@app.get("/{product_id}", response_model=ProductResponse)
async def read_product(
    product_id: int,
    db: AsyncSession = Depends(get_product_db) # Type hint with AsyncSession
):
    product_result = await db.execute(select(Product).filter(Product.id == product_id))
    product = product_result.scalar_one_or_none() # Use scalar_one_or_none for a single result
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product

@app.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: AsyncSession = Depends(get_product_db), # Type hint with AsyncSession
    current_user: User = Depends(get_current_user)
):
    product_result = await db.execute(select(Product).filter(Product.id == product_id))
    db_product = product_result.scalar_one_or_none()
    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    for key, value in product_update.dict(exclude_unset=True).items():
        setattr(db_product, key, value)
    db_product.updated_at = func.now() # Manually update timestamp (SQLAlchemy `onupdate` handles this too)
    
    # db.add(db_product) # Not strictly necessary for updates if object is already tracked by session
    await db.commit() # Await commit
    await db.refresh(db_product) # Await refresh
    return db_product

@app.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_product_db), # Type hint with AsyncSession
    current_user: User = Depends(get_current_user)
):
    product_result = await db.execute(select(Product).filter(Product.id == product_id))
    db_product = product_result.scalar_one_or_none()
    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    await db.delete(db_product) # Await delete
    await db.commit() # Await commit
    return {} # Return empty dict for 204 No Content status