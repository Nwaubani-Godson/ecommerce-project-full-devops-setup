import pytest  # type: ignore
import pytest_asyncio  # type: ignore
from httpx import AsyncClient  # type: ignore
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker  # type: ignore
from sqlalchemy import select  # type: ignore
from uuid import uuid4

from shared.config import DATABASE_URL
from shared.models import User
from shared.security import get_current_user, verify_password
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
    return User(id=1, username="test_auth_user", email="auth@example.com", hashed_password="mocked_hash")


@pytest_asyncio.fixture(scope="function")
async def mock_auth_user_override():
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    app.dependency_overrides.pop(get_current_user, None)


@pytest.mark.asyncio
async def test_create_user(client: AsyncClient, db_session: AsyncSession):
    unique_suffix = uuid4().hex[:8]
    user_data = {
        "username": f"newuser_{unique_suffix}",
        "email": f"new_{unique_suffix}@example.com",
        "password": "securepassword"
    }

    response = await client.post("/users/register", json=user_data)
    assert response.status_code == 201

    resp = response.json()
    assert resp["username"] == user_data["username"]
    assert resp["email"] == user_data["email"]
    assert "id" in resp
    assert "created_at" in resp
    assert "hashed_password" not in resp  # Password not included in response

    # Verify saved in DB
    result = await db_session.execute(select(User).where(User.email == user_data["email"]))
    user_in_db = result.scalar_one_or_none()
    assert user_in_db is not None
    assert user_in_db.username == user_data["username"]
    assert verify_password(user_data["password"], user_in_db.hashed_password)
