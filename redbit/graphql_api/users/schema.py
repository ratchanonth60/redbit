import strawberry
import strawberry_django
from apps.users.models import User


@strawberry_django.type(User, fields="__all__")
class UserType:
    pass

@strawberry.type
class UserQuery:
    @strawberry.field
    def hello_user(self) -> str:
        # query ทดสอบ
        return "Hello from the User app!"
