import pytest # type: ignore
import pytest_asyncio # type: ignore
import uuid
from decimal import Decimal
from httpx import AsyncClient # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker # type: ignore
from sqlalchemy import select # type: ignore

from shared.config import DATABASE_URL
from shared.models import User, Product, Cart, CartItem
from shared.security import get_current_user
from main import app, get_order_db

engine = create_async_engine(DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

@pytest_asyncio.fixture(scope="function")
async def db_session():
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()  # rollback changes after each test

@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession):
    async def override_get_order_db():
        yield db_session

    app.dependency_overrides[get_order_db] = override_get_order_db

    async with AsyncClient(app=app, base_url="http://test/orders") as ac:
        yield ac

    app.dependency_overrides.pop(get_order_db, None)

@pytest_asyncio.fixture(scope="function")
async def mock_auth_user_override(db_session: AsyncSession):
    unique_email = f"orderuser_{uuid.uuid4().hex[:8]}@example.com"
    user = User(username=f"orderuser_{uuid.uuid4().hex[:6]}", email=unique_email, hashed_password="mockpass")
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    async def override_current_user():
        return user

    app.dependency_overrides[get_current_user] = override_current_user
    yield
    app.dependency_overrides.pop(get_current_user, None)

@pytest.mark.asyncio
async def test_create_order_from_cart(client: AsyncClient, db_session: AsyncSession, mock_auth_user_override):
    current_user = await app.dependency_overrides[get_current_user]()

    # Create products
    prod1 = Product(
        name=f"Prod1_{uuid.uuid4().hex[:6]}",
        description="desc1",
        price=Decimal("10.00"),
        stock_quantity=5
    )
    prod2 = Product(
        name=f"Prod2_{uuid.uuid4().hex[:6]}",
        description="desc2",
        price=Decimal("20.00"),
        stock_quantity=3
    )

    db_session.add_all([prod1, prod2])
    await db_session.commit()
    await db_session.refresh(prod1)
    await db_session.refresh(prod2)

    # Create or get cart for user
    cart = await db_session.scalar(select(Cart).where(Cart.user_id == current_user.id))
    if not cart:
        cart = Cart(user_id=current_user.id)
        db_session.add(cart)
        await db_session.commit()
        await db_session.refresh(cart)

    # Add items to cart
    item1 = CartItem(cart_id=cart.id, product_id=prod1.id, quantity=2, price_at_add=prod1.price)
    item2 = CartItem(cart_id=cart.id, product_id=prod2.id, quantity=1, price_at_add=prod2.price)
    db_session.add_all([item1, item2])
    await db_session.commit()

    # Call the create order endpoint
    response = await client.post("/")
    assert response.status_code == 201

    data = response.json()
    assert data["user_id"] == current_user.id

    expected_total = prod1.price * 2 + prod2.price * 1
    total_amount = Decimal(str(data["total_amount"]))
    assert abs(total_amount - expected_total) < Decimal("0.01")

    assert "items" in data
    assert len(data["items"]) == 2
