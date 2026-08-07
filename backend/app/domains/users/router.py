from fastapi import APIRouter, Depends, status, Response
from app.domains.users.schemas import UserCreate, UserResponse, LoginRequest, TokenResponse
from app.domains.users.service import AuthService
from app.domains.users.models import User
from app.api.dependencies import get_auth_service, get_current_user
from app.utils.pagination import PageParams, PaginatedResponse

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
    
    response.set_cookie(
        key="refresh_token",
        value="dummy_refresh_token",
        httponly=True,
        secure=True,
        samesite="lax"
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("", response_model=PaginatedResponse[UserResponse])
async def list_users(
    params: PageParams = Depends(),
    auth_service: AuthService = Depends(get_auth_service)
):
    return await auth_service.list_users(params)

@router.get("/github/login")
async def github_login():
    return {"message": "Redirect to GitHub OAuth page"}

@router.get("/github/callback")
async def github_callback(code: str, auth_service: AuthService = Depends(get_auth_service)):
    return {"message": "OAuth Callback handled, returning JWT"}

@router.api_route("/refresh", methods=["GET", "POST"])
async def refresh_token(
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    access_token = auth_service.create_access_token(
        data={"sub": str(current_user.id), "email": current_user.email}
    )
    return {"access_token": access_token, "token_type": "bearer"}
