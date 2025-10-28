import strawberry
import strawberry_django
from apps.users.models import User
from gqlauth.user.queries import UserQueries


@strawberry_django.type(User, fields="__all__")
class UserType:
    pass

@strawberry.type
class UserQuery:
    me = UserQueries.me
    public = UserQueries.public_user
    @strawberry.field
    def hello_user(self) -> str:
        # query ทดสอบ
        return "Hello from the User app!"
