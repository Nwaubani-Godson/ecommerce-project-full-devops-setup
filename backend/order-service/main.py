from typing import List
from fastapi import FastAPI, Depends, HTTPException, status # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession # type: ignore
from sqlalchemy.orm import selectinload # type: ignore
from sqlalchemy.sql import func # type: ignore
from sqlalchemy import select # type: ignore

from shared.database import get_db, Base, get_engine
from shared.models import Order, OrderItem, Product, Cart, CartItem, User
from shared.schemas import OrderResponse
from shared.security import get_current_user
from shared.config import DATABASE_URL

app = FastAPI(
    title="Order Service",
    description="Manages order creation and history.",
    version="1.0.0",
    root_path="/orders",  # Important for proxy routing
)

async def get_order_db():
    async for session in get_db(DATABASE_URL):
        yield session

@app.on_event("startup")
async def startup_event():
    engine = await get_engine(DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Order service database tables checked/created.")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order_from_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_order_db),
):
    # Fetch cart asynchronously
    cart_result = await db.execute(select(Cart).where(Cart.user_id == current_user.id))
    cart = cart_result.scalar_one_or_none()
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found for this user")

    # Fetch cart items asynchronously
    cart_items_result = await db.execute(select(CartItem).where(CartItem.cart_id == cart.id))
    cart_items = cart_items_result.scalars().all()
    if not cart_items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    total_amount = 0.0
    order_items_to_create = []
    products_to_update = []

    for cart_item in cart_items:
        # Fetch product asynchronously
        product_result = await db.execute(select(Product).where(Product.id == cart_item.product_id))
        product = product_result.scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"Product with ID {cart_item.product_id} not found.")
        if product.stock_quantity < cart_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for product '{product.name}'. Available: {product.stock_quantity}, Requested: {cart_item.quantity}"
            )

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
        status="pending",
        created_at=func.now(),
        updated_at=func.now()
    )
    db.add(new_order)
    await db.commit()  # Commit to get order ID
    await db.refresh(new_order)

    # Create order items and update product stock
    for item_data in order_items_to_create:
        order_item = OrderItem(order_id=new_order.id, **item_data)
        db.add(order_item)

    for product_to_update in products_to_update:
        db.add(product_to_update)

    # Clear the cart items
    for cart_item in cart_items:
        await db.delete(cart_item)

    await db.commit()
    await db.refresh(new_order)

    # Eager load order items for complete response
    order_with_items_result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == new_order.id)
    )
    order_with_items = order_with_items_result.scalar_one_or_none()
    return order_with_items

@app.get("/", response_model=List[OrderResponse])
async def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_order_db),
):
    orders_result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == current_user.id)
    )
    orders = orders_result.scalars().all()
    return orders

@app.get("/{order_id}", response_model=OrderResponse)
async def get_order_details(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_order_db),
):
    order_result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = order_result.scalar_one_or_none()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found or you don't have permission to view it",
        )
    return order
