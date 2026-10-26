"""Test setup: temp database, and the real LLM switched off so tests are fast and offline."""
import os
import tempfile

import pytest

_db_file = os.path.join(tempfile.mkdtemp(), "test_neurohaven.db")
os.environ["DATABASE_URL"] = f"sqlite:///{_db_file}"
os.environ["LLM_DISABLED"] = "1"

from fastapi.testclient import TestClient  # noqa: E402

from database import Base, engine  # noqa: E402
from main import app  # noqa: E402


@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
