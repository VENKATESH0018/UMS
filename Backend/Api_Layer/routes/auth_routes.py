from fastapi import APIRouter
from ..interfaces.auth import RegisterUser, LoginUser, ForgotPassword
from ...Business_Layer.services.auth_service import AuthService

router = APIRouter()

# Instantiate service per request (no shared singleton)
# If needed, can cache in future
auth_service = AuthService()

@router.post("/register")
def register(user_data: RegisterUser):
    return auth_service.register_user(user_data)


@router.post("/login")
def login(credentials: LoginUser):
    return auth_service.login_user(credentials)


@router.get("/forgot-password/{email}")
def check_user_status(email: str):
    return auth_service.check_user_exists(email)


@router.post("/forgot-password")
def forgot_password(update: ForgotPassword):
    return auth_service.forgot_password(update)
