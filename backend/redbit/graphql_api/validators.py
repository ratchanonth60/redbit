import re


def validate_username(username):
    regex = r"^[a-zA-Z0-9_]+$"
    return re.match(regex, username)


def validate_post_title(title):
    if len(title) < 3 or len(title) > 300:
        return Exception("Title must be between 3 and 300 characters.")
    return title
