from fastapi import FastAPI, Depends, HTTPException, status # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession # type: ignore # Import AsyncSession
from sqlalchemy.orm import relationship, joinedload # type: ignore # relationship needed for eager loading, joinedload for eager loading in queries
from sqlalchemy.sql import func # type: ignore
from sqlalchemy import select # type: ignore # Import select for async ORM queries
from prometheus_fastapi_instrumentator import Instrumentator # type: ignore

# Import shared components
from shared.database import get_db, Base, get_engine # get_db is now async
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

# --- PROMETHEUS INSTRUMENTATION START ---
# Initialize Prometheus instrumentation on startup
# This automatically exposes the /metrics endpoint
Instrumentator().instrument(app).expose(app)
print("Prometheus metrics exposed at /metrics")
# --- PROMETHEUS INSTRUMENTATION END ---

# Custom dependency for the cart service's asynchronous database connection
async def get_cart_db():
    # Await the asynchronous get_db from shared.database
    async for session in get_db(DATABASE_URL):
        yield session

# Use FastAPI's lifespan events for startup/shutdown (replaces deprecated on_event)
@app.on_event("startup") # Deprecated, but keeping for now as it's in your original structure
async def startup_event():
    # Ensure the engine is created asynchronously
    engine = await get_engine(DATABASE_URL)
    # You might want to run Base.metadata.create_all here for application startup,
    # but ensure it's done with an async connection.
    # For production, migrations (e.g., Alembic) are preferred over create_all on startup.
    async with engine.begin() as conn:
        # This creates tables if they don_t exist. For production, use Alembic migrations.
        await conn.run_sync(Base.metadata.create_all)
    print("Cart service database tables checked/created.")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/", response_model=CartResponse)
async def get_user_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_cart_db) # Type hint with AsyncSession
):
    # Eager load cart items for the response using async ORM query
    # Use select() and await db.execute() for async queries
    cart_result = await db.execute(
        select(Cart)
        .options(joinedload(Cart.items)) # Corrected: Use joinedload for eager loading
        .filter(Cart.user_id == current_user.id)
    )
    # Add .unique() when eager loading collections to handle duplicate parent rows
    cart = cart_result.unique().scalar_one_or_none() # Added .unique()

    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found for this user")
    return cart

@app.post("/items", response_model=CartResponse, status_code=status.HTTP_200_OK)
async def add_item_to_cart(
    item: CartItemBase,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_cart_db) # Type hint with AsyncSession
):
    cart_result = await db.execute(
        select(Cart).filter(Cart.user_id == current_user.id)
    )
    cart = cart_result.scalar_one_or_none()
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found for this user")

    product_result = await db.execute(
        select(Product).filter(Product.id == item.product_id)
    )
    product = product_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if product.stock_quantity < item.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough stock for this product")

    cart_item_result = await db.execute(
        select(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == item.product_id
        )
    )
    cart_item = cart_item_result.scalar_one_or_none()

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
    await db.commit() # Await commit
    await db.refresh(cart) # Await refresh
    if cart_item:
        await db.refresh(cart_item) # Await refresh

    # Re-fetch cart with items to ensure response is complete (including relations)
    # This needs to be done after commit and refresh to get the updated state
    cart_with_items_result = await db.execute(
        select(Cart)
        .options(joinedload(Cart.items)) # Corrected: Use joinedload for eager loading
        .filter(Cart.user_id == current_user.id)
    )
    # Add .unique() when eager loading collections to handle duplicate parent rows
    cart_with_items = cart_with_items_result.unique().scalar_one_or_none() # Added .unique()
    return cart_with_items

@app.put("/items/{product_id}", response_model=CartResponse)
async def update_cart_item_quantity(
    product_id: int,
    quantity: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_cart_db) # Type hint with AsyncSession
):
    cart_result = await db.execute(
        select(Cart).filter(Cart.user_id == current_user.id)
    )
    cart = cart_result.scalar_one_or_none()
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found for this user")

    cart_item_result = await db.execute(
        select(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id
        )
    )
    cart_item = cart_item_result.scalar_one_or_none()

    if not cart_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not in cart")

    if quantity <= 0:
        await db.delete(cart_item) # Await delete
    else:
        product_result = await db.execute(
            select(Product).filter(Product.id == product_id)
        )
        product = product_result.scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        if product.stock_quantity < quantity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough stock for this quantity")
        cart_item.quantity = quantity
        cart_item.price_at_add = product.price # Update price in case it changed

    cart.updated_at = func.now() # Update cart timestamp
    await db.commit() # Await commit

    # Re-fetch cart with items to ensure response is complete
    cart_with_items_result = await db.execute(
        select(Cart)
        .options(joinedload(Cart.items)) # Corrected: Use joinedload for eager loading
        .filter(Cart.user_id == current_user.id)
    )
    # Add .unique() when eager loading collections to handle duplicate parent rows
    cart_with_items = cart_with_items_result.unique().scalar_one_or_none() # Added .unique()
    return cart_with_items

@app.delete("/items/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_item_from_cart(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_cart_db) # Type hint with AsyncSession
):
    cart_result = await db.execute(
        select(Cart).filter(Cart.user_id == current_user.id)
    )
    cart = cart_result.scalar_one_or_none()
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found for this user")

    cart_item_result = await db.execute(
        select(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id
        )
    )
    cart_item = cart_item_result.scalar_one_or_none()

    if not cart_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not in cart")

    await db.delete(cart_item) # Await delete
    cart.updated_at = func.now() # Update cart timestamp
    await db.commit() # Await commit
    # No return value needed for 204 No Content, but FastAPI might complain if nothing is returned.
    # Returning an empty dict or None is common for 204.
    return {} # Return empty dict for 204 No Content status
