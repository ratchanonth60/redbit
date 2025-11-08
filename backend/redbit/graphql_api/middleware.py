from django.utils.log import logging
from graphql import GraphQLError


class ErrorHandlingMiddleware:
    def resolve(self, next, root, info, **kwargs):
        try:
            return next(root, info, **kwargs)
        except Exception as e:
            # Log error
            logging.error(e)
            raise GraphQLError(message=str(e))
