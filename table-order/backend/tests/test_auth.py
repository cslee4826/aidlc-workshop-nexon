import pytest

from app.utils.security import create_access_token, decode_access_token, hash_password, verify_password


def test_password_hashing():
    password = "test_password_123"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrong_password", hashed)


def test_jwt_token_creation_and_decoding():
    data = {"admin_id": "test-id", "store_id": "store-id", "username": "admin"}
    token = create_access_token(data)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["admin_id"] == "test-id"
    assert decoded["store_id"] == "store-id"
    assert decoded["username"] == "admin"


def test_jwt_invalid_token():
    decoded = decode_access_token("invalid-token")
    assert decoded is None
