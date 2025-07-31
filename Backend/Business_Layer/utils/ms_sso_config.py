from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from ...config.env_loader import get_env_var

config = Config(environ={
    'CLIENT_ID': get_env_var("CLIENT_ID"),
    'CLIENT_SECRET': get_env_var("CLIENT_SECRET")
})

oauth = OAuth(config)

oauth.register(
    name='microsoft',
    client_id=get_env_var("CLIENT_ID"),
    client_secret=get_env_var("CLIENT_SECRET"),
    server_metadata_url=f"https://login.microsoftonline.com/{get_env_var("TENANT_ID")}/v2.0/.well-known/openid-configuration",
    client_kwargs={
        'scope': 'openid profile email'
    }
)
