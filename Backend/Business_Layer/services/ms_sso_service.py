from Business_Layer.utils.ms_sso_config import oauth
from fastapi import Request

async def redirect_to_microsoft_login(request: Request):
    redirect_uri = request.url_for('auth_callback')
    return await oauth.microsoft.authorize_redirect(request, redirect_uri)

async def process_microsoft_callback(request: Request):
    token = await oauth.microsoft.authorize_access_token(request)
    user = await oauth.microsoft.parse_id_token(request, token)
    return user
