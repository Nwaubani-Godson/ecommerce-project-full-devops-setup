import pytest  # type: ignore
import pytest_asyncio  # type: ignore
from httpx import AsyncClient  # type: ignore
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker  # type: ignore
from sqlalchemy import select  # type: ignore
from uuid import uuid4  # add this import

from shared.config import DATABASE_URL
from shared.models import Product, User
from shared.security import get_current_user
from main import app, get_db

engine = create_async_engine(DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

@pytest_asyncio.fixture(scope="function")
async def db_session():
    async with SessionLocal() as session:
        yield session
        await session.rollback()

@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession):
    async def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()

async def override_get_current_user():
    return User(id=1, username="test_admin", email="admin@example.com", hashed_password="mocked_hash")

@pytest_asyncio.fixture(scope="function")
async def mock_auth_user_override():
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    app.dependency_overrides.pop(get_current_user, None)

@pytest.mark.asyncio
async def test_create_product(client: AsyncClient, db_session: AsyncSession, mock_auth_user_override):
    unique_name = f"Test Product {uuid4().hex[:8]}"  # append UUID for uniqueness
    product_data = {
        "name": unique_name,
        "description": "Wonderful test product.",
        "price": 9.99,
        "stock_quantity": 100
    }
    response = await client.post("/", json=product_data)
    assert response.status_code == 201

    result = await db_session.execute(select(Product).where(Product.name == unique_name))
    product_in_db = result.scalar_one_or_none()
    assert product_in_db is not None
    assert product_in_db.stock_quantity == 100

# Add more product service tests same pattern...
