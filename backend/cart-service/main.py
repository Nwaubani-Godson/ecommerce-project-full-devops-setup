from fastapi import FastAPI, Depends, HTTPException, status # type: ignore
from sqlalchemy.orm import Session, relationship # type: ignore # relationship needed for eager loading
from sqlalchemy.sql import func # type: ignore

# Import shared components
from shared.database import get_db, Base, get_engine
from shared.models import Cart, CartItem, Product, User
from shared.schemas import CartItemBase, CartResponse
from shared.security import get_current_user
from shared.config import DATABASE_URL

app = FastAPI(
    title="Cart Service",
    description="Manages user shopping carts.",
    version="1.0.0",
    root_path="/cart" # This is important for the Nginx proxy routing
)

# Custom dependency for the cart service's database connection
def get_cart_db():
    yield from get_db(DATABASE_URL)

@app.on_event("startup")
async def startup_event():
    engine = get_engine(DATABASE_URL)
    # Base.metadata.create_all(bind=engine)
    print("Cart service ready to connect to database.")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/", response_model=CartResponse)
def get_user_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_cart_db)):
    # Eager load cart items for the response
    cart = db.query(Cart).options(relationship("items")).filter(Cart.user_id == current_user.id).first()
    if not cart:
        # This case should ideally not happen if a cart is created on user registration
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found for this user")
    return cart

@app.post("/items", response_model=CartResponse, status_code=status.HTTP_200_OK)
def add_item_to_cart(item: CartItemBase, current_user: User = Depends(get_current_user), db: Session = Depends(get_cart_db)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found for this user")

    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if product.stock_quantity < item.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough stock for this product")

    cart_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item.product_id
    ).first()

    if cart_item:
        cart_item.quantity += item.quantity
        cart_item.price_at_add = product.price # Update price in case it changed
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_add=product.price
        )
        db.add(cart_item)

    cart.updated_at = func.now() # Update cart timestamp
    db.commit()
    db.refresh(cart)
    if cart_item: # Refresh the item to get its ID if new or updated
        db.refresh(cart_item)

    # Re-fetch cart with items to ensure response is complete (including relations)
    cart_with_items = db.query(Cart).options(relationship("items")).filter(Cart.user_id == current_user.id).first()
    return cart_with_items

@app.put("/items/{product_id}", response_model=CartResponse)
def update_cart_item_quantity(product_id: int, quantity: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_cart_db)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found for this user")

    cart_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == product_id
    ).first()

    if not cart_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not in cart")

    if quantity <= 0:
        db.delete(cart_item)
    else:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        if product.stock_quantity < quantity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough stock for this quantity")
        cart_item.quantity = quantity
        cart_item.price_at_add = product.price # Update price in case it changed
    
    cart.updated_at = func.now() # Update cart timestamp
    db.commit()
    
    # Re-fetch cart with items to ensure response is complete
    cart_with_items = db.query(Cart).options(relationship("items")).filter(Cart.user_id == current_user.id).first()
    return cart_with_items

@app.delete("/items/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_item_from_cart(product_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_cart_db)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found for this user")

    cart_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == product_id
    ).first()

    if not cart_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not in cart")

    db.delete(cart_item)
    cart.updated_at = func.now() # Update cart timestamp
    db.commit()
    return {"message": "Item removed from cart successfully"}