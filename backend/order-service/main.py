from typing import List
from fastapi import FastAPI, Depends, HTTPException, status # type: ignore
from sqlalchemy.orm import Session, relationship # type: ignore # relationship needed for eager loading
from sqlalchemy.sql import func # type: ignore

# Import shared components
from shared.database import get_db, Base, get_engine
from shared.models import Order, OrderItem, Product, Cart, CartItem, User
from shared.schemas import OrderResponse, OrderItemResponse
from shared.security import get_current_user
from shared.config import DATABASE_URL

app = FastAPI(
    title="Order Service",
    description="Manages order creation and history.",
    version="1.0.0",
    root_path="/orders" # This is important for the Nginx proxy routing
)

# Custom dependency for the order service's database connection
def get_order_db():
    yield from get_db(DATABASE_URL)

@app.on_event("startup")
async def startup_event():
    engine = get_engine(DATABASE_URL)
    # Base.metadata.create_all(bind=engine)
    print("Order service ready to connect to database.")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order_from_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_order_db)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found for this user")

    cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
    if not cart_items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    total_amount = 0.0
    order_items_to_create = []
    products_to_update = []

    for cart_item in cart_items:
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with ID {cart_item.product_id} not found.")
        if product.stock_quantity < cart_item.quantity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Not enough stock for product '{product.name}'. Available: {product.stock_quantity}, Requested: {cart_item.quantity}")

        # Calculate total amount and prepare order items
        item_total = float(product.price) * cart_item.quantity
        total_amount += item_total
        order_items_to_create.append({
            "product_id": product.id,
            "quantity": cart_item.quantity,
            "price_at_purchase": float(product.price)
        })

        # Prepare product stock update
        product.stock_quantity -= cart_item.quantity
        products_to_update.append(product)

    # Create the order
    new_order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status="pending"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order) # Refresh to get order_id

    # Create order items and update product stock
    for item_data in order_items_to_create:
        order_item = OrderItem(order_id=new_order.id, **item_data)
        db.add(order_item)

    for product_to_update in products_to_update:
        db.add(product_to_update) # Re-add to session to ensure update is tracked

    # Clear the cart after order creation
    for cart_item in cart_items:
        db.delete(cart_item)

    db.commit()
    db.refresh(new_order) # Refresh order again to get its items relationship loaded

    # Eager load order items for the response
    order_with_items = db.query(Order).options(relationship("items")).filter(Order.id == new_order.id).first()
    return order_with_items

@app.get("/", response_model=List[OrderResponse])
def get_user_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_order_db)):
    orders = db.query(Order).filter(Order.user_id == current_user.id).all()
    # Eager load items for each order before returning
    for order in orders:
        db.refresh(order) # Ensures items are loaded
    return orders

@app.get("/{order_id}", response_model=OrderResponse)
def get_order_details(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_order_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found or you don't have permission to view it")
    db.refresh(order) # Ensure items relationship is loaded
    return order