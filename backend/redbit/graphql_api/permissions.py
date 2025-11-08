from graphql_jwt.decorators import login_required
from functools import wraps


def is_owner_or_staff(model_field="author"):
    """Decorator to check if user is owner or staff"""

    def decorator(func):
        @wraps(func)
        def wrapper(root, info, *args, **kwargs):
            user = info.context.user
            if not user.is_authenticated:
                raise Exception("Authentication required")

            # Get object
            obj_id = kwargs.get("id") or kwargs.get("post_id") or kwargs.get("comment_id")
            # Check ownership
            user_is_owner = getattr(root, model_field) == user
            # ... implementation

            return func(root, info, *args, **kwargs)

        return wrapper

    return decorator

