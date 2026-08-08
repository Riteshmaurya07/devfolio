from fastapi import APIRouter, Depends, status, Response, Request, HTTPException
from app.domains.users.schemas import UserCreate, UserResponse, LoginRequest, TokenResponse
from app.domains.users.service import AuthService
from app.domains.users.models import User
from app.api.dependencies import get_auth_service, get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate, 
    auth_service: AuthService = Depends(get_auth_service)
):
    return await auth_service.register_user(user_in)

@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginRequest,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service)
):
    user = await auth_service.authenticate_user(login_data)
    access_token = auth_service.create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    from app.core.config import settings
    from datetime import timedelta
    refresh_token = auth_service.create_access_token(
        data={"sub": str(user.id), "type": "refresh"},
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    # Set HttpOnly cookie for refresh token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax"
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/github/login")
async def github_login():
    from app.core.config import settings
    from fastapi.responses import RedirectResponse
    github_auth_url = f"https://github.com/login/oauth/authorize?client_id={settings.GITHUB_CLIENT_ID}&scope=user:email"
    return RedirectResponse(github_auth_url)

@router.get("/github/callback")
async def github_callback(code: str, auth_service: AuthService = Depends(get_auth_service)):
    from app.core.config import settings
    from fastapi.responses import RedirectResponse
    import httpx
    import uuid

    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code
            },
            headers={"Accept": "application/json"}
        )
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=github_auth_failed")

        # Fetch user profile
        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_data = user_res.json()
        
        # Check if user exists or create them
        user = await auth_service.user_repo.get_by_email(user_data["email"] or f"{user_data['login']}@github.local")
        if not user:
            from app.domains.users.schemas import UserCreate
            user = await auth_service.user_repo.create(UserCreate(
                username=user_data["login"],
                email=user_data["email"] or f"{user_data['login']}@github.local",
                password=str(uuid.uuid4()) # OAuth users don't need a real password
            ))
            # Optional: update avatar_url directly in DB if we added it to model
            
        jwt_token = auth_service.create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )
        
        from datetime import timedelta
        refresh_token = auth_service.create_access_token(
            data={"sub": str(user.id), "type": "refresh"},
            expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        
        response = RedirectResponse(f"{settings.FRONTEND_URL}/auth/github/callback?token={jwt_token}")
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite="lax"
        )
        return response

@router.post("/refresh")
async def refresh_token(
    request: Request,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service)
):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
        
    try:
        from app.core.config import settings
        import jwt
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
            
        user = await auth_service.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
            
        # Issue new access token
        access_token = auth_service.create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )
        
        # Issue new refresh token
        from datetime import timedelta
        new_refresh_token = auth_service.create_access_token(
            data={"sub": str(user.id), "type": "refresh"},
            expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite="lax"
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
