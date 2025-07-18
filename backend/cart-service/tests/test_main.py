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
from main import app, get_cart_db

engine = create_async_engine(DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

@pytest_asyncio.fixture(scope="function")
async def db_session():
    async with SessionLocal() as session:
        yield session
        await session.rollback()

@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession):
    async def override_get_cart_db():
        yield db_session

    app.dependency_overrides[get_cart_db] = override_get_cart_db

    async with AsyncClient(app=app, base_url="http://test/cart") as ac:
        yield ac

    app.dependency_overrides.pop(get_cart_db, None)

@pytest_asyncio.fixture(scope="function")
async def mock_auth_user_override(db_session: AsyncSession):
    unique_email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    user = User(username=f"user_{uuid.uuid4().hex[:6]}", email=unique_email, hashed_password="testpass")
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    async def override_current_user():
        return user

    app.dependency_overrides[get_current_user] = override_current_user
    yield
    app.dependency_overrides.pop(get_current_user, None)

@pytest.mark.asyncio
async def test_add_item_to_cart(client: AsyncClient, db_session: AsyncSession, mock_auth_user_override):
    current_user = await app.dependency_overrides[get_current_user]()

    # Create a product
    product = Product(name=f"Prod_{uuid.uuid4().hex[:6]}", description="desc", price=Decimal("10.00"), stock_quantity=5)
    db_session.add(product)
    await db_session.commit()
    await db_session.refresh(product)

    # Check if user already has a cart — reuse or create
    cart = await db_session.scalar(select(Cart).where(Cart.user_id == current_user.id))
    if not cart:
        cart = Cart(user_id=current_user.id)
        db_session.add(cart)
        await db_session.commit()
        await db_session.refresh(cart)

    # Add item to cart via API
    response = await client.post("/items", json={"product_id": product.id, "quantity": 1})
    assert response.status_code == 200

    data = response.json()
    assert data["user_id"] == current_user.id
    assert any(item["product_id"] == product.id for item in data["items"])
