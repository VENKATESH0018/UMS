from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ...Api_Layer.interfaces.auth import RegisterUser, LoginUser, ForgotPassword
from ...Data_Access_Layer.dao.auth_dao import AuthDAO
from ...Api_Layer.JWT.token_creation.token_create import token_create
from ..utils.password_utils import hash_password, check_password_or_raise, verify_password
from ..utils.input_validators import validate_email_format, validate_password_strength
from ...Data_Access_Layer.utils.dependency import get_db  # only used here



class AuthService:
    """
    Handles business logic and internally manages DB session.
    """

    def __init__(self):
        # Internally create a DB session for each operation
        pass

    def _get_dao(self) -> AuthDAO:
        db: Session = next(get_db())  # Internal DB session management
        return AuthDAO(db)

    def register_user(self, user_data: RegisterUser):
        dao = self._get_dao()

        validate_email_format(user_data.mail)
        validate_password_strength(user_data.password)

        if dao.get_user_by_email(user_data.mail):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already exists with this email."
            )

        hashed_password = hash_password(user_data.password)
        created_user = dao.create_user(user_data, hashed_password)

        return {"msg": "User registered successfully", "user_id": created_user.user_id}

    def login_user(self, credentials: LoginUser):
        dao = self._get_dao()

        user = dao.get_active_user_by_email(credentials.email)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found or inactive")

        verify_password(credentials.password, user.password)

        roles = dao.get_user_roles(user.user_id)
        group_ids = dao.get_permission_group_ids_for_user(user.user_id)
        permissions = dao.get_permissions_by_group_ids(group_ids)

        token_data = {
            "sub": str(user.user_id),
            "user_id": user.user_id,
            "name": user.first_name + " " + user.last_name,
            "email": user.mail,
            "roles": roles,
            "permissions": permissions
        }
        access_token = token_create(token_data)

        redirect = "/admin-dashboard" if "Admin" in roles or "Super Admin" in roles else "/home"

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "redirect": redirect
        }

    def forgot_password(self, forgot_data: ForgotPassword):
        dao = self._get_dao()

        # 1. Check user exists
        user = dao.get_user_by_email(forgot_data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found with given email"
            )

        # 2. Validate OTP
        otp_record = dao.get_valid_otp(forgot_data.email, forgot_data.otp)
        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )

        dao.delete_otp(otp_record)

        # 3. Hash new password
        hashed_pw = hash_password(forgot_data.new_password)

        # 4. Update password and activate user
        if not dao.update_user_password(user, hashed_pw):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update password"
            )

        return {"message": "Password updated and user activated"}


    def check_user_exists(self, email: str):
        dao = self._get_dao()

        user = dao.get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found with this email")

        return {"msg": "User exists"}
    
