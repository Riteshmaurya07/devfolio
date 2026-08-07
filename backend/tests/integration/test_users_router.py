import pytest

@pytest.mark.asyncio
async def test_register_and_login_router(client):
    # Test Register
    reg_resp = await client.post(
        "/api/users/register",
        json={
            "username": "router_user",
            "email": "router@example.com",
            "password": "routerpassword"
        }
    )
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    assert data["email"] == "router@example.com"
    assert "id" in data

    # Test Login
    login_resp = await client.post(
        "/api/users/login",
        json={
            "email": "router@example.com",
            "password": "routerpassword"
        }
    )
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
