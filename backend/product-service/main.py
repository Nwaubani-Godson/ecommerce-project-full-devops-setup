from typing import List
from fastapi import FastAPI, Depends, HTTPException, status # type: ignore
from sqlalchemy.orm import Session # type: ignore
from sqlalchemy.sql import func # type: ignore # For timestamps

# Import shared components
from shared.database import get_db, Base, get_engine
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

# Custom dependency for the product service's database connection
def get_product_db():
    yield from get_db(DATABASE_URL)

@app.on_event("startup")
async def startup_event():
    engine = get_engine(DATABASE_URL)
    # Base.metadata.create_all(bind=engine)
    print("Product service ready to connect to database.")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate, db: Session = Depends(get_product_db), current_user: User = Depends(get_current_user)):
    # For simplicity, allowing any logged-in user to create products.
    # In a real app, you'd add admin/seller roles and checks here.
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/", response_model=List[ProductResponse])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_product_db)):
    products = db.query(Product).offset(skip).limit(limit).all()
    return products

@app.get("/{product_id}", response_model=ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_product_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product

@app.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_update: ProductUpdate, db: Session = Depends(get_product_db), current_user: User = Depends(get_current_user)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    for key, value in product_update.dict(exclude_unset=True).items():
        setattr(db_product, key, value)
    db_product.updated_at = func.now() # Manually update timestamp (SQLAlchemy `onupdate` handles this too)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_product_db), current_user: User = Depends(get_current_user)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}