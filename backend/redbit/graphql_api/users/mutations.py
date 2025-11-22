import graphene
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from graphql_jwt.decorators import login_required

from .types import UserType

User = get_user_model()

class RegisterUser(graphene.Mutation):
    """Register new user"""
    class Arguments:
        username = graphene.String(required=True)
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    success = graphene.Boolean()
    user = graphene.Field(UserType)
    errors = graphene.List(graphene.String)

    @classmethod
    def mutate(cls, root, info, username, email, password):
        errors = []
        
        # Validation
        if len(username) < 3 or len(username) > 30:
            errors.append("Username must be between 3 and 30 characters.")
        
        if not username.isalnum() and "_" not in username:
             errors.append("Username can only contain letters, numbers, and underscores.")
            
        if User.objects.filter(username=username).exists():
            errors.append("Username already exists.")
        
        if User.objects.filter(email=email).exists():
            errors.append("Email already exists.")
        
        try:
            validate_password(password)
        except ValidationError as e:
            errors.extend(e.messages)
        
        if errors:
            return cls(success=False, errors=errors)
        
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_active=True  # หรือ False ถ้าต้องการ email verification
            )
            
            # Send confirmation email (async task)
            # send_confirmation_email_task.delay(user_id=user.id)
            
            return cls(success=True, user=user, errors=[])
        except Exception as e:
            return cls(success=False, errors=[str(e)])


class UpdateProfile(graphene.Mutation):
    """Update user profile"""
    class Arguments:
        bio = graphene.String()
        profile_picture = graphene.String()
        banner_image = graphene.String()

    success = graphene.Boolean()
    user = graphene.Field(UserType)
    errors = graphene.List(graphene.String)

    @login_required
    def mutate(self, info, **kwargs):
        user = info.context.user
        errors = []
        
        try:
            if 'bio' in kwargs:
                if len(kwargs['bio']) > 500:
                    errors.append("Bio must be less than 500 characters.")
                else:
                    user.bio = kwargs['bio']
            
            if 'profile_picture' in kwargs:
                url = kwargs['profile_picture']
                if url:
                    val = URLValidator()
                    try:
                        val(url)
                    except ValidationError:
                        errors.append("Invalid profile picture URL.")
                user.profile_picture = url
            
            if 'banner_image' in kwargs:
                url = kwargs['banner_image']
                if url:
                    val = URLValidator()
                    try:
                        val(url)
                    except ValidationError:
                        errors.append("Invalid banner image URL.")
                user.banner_image = url
            
            if errors:
                return UpdateProfile(success=False, errors=errors)
            
            user.save()
            return UpdateProfile(success=True, user=user, errors=[])
        except Exception as e:
            return UpdateProfile(success=False, errors=[str(e)])


class UpdateSettings(graphene.Mutation):
    """Update user settings"""
    class Arguments:
        notifications_enabled = graphene.Boolean()
        dark_mode = graphene.Boolean()

    success = graphene.Boolean()
    user = graphene.Field(UserType)

    @login_required
    def mutate(self, info, **kwargs):
        user = info.context.user
        
        if 'notifications_enabled' in kwargs:
            user.notifications_enabled = kwargs['notifications_enabled']
        
        if 'dark_mode' in kwargs:
            user.dark_mode = kwargs['dark_mode']
        
        user.save()
        return UpdateSettings(success=True, user=user)


class FollowUser(graphene.Mutation):
    """Follow/Unfollow user"""
    class Arguments:
        username = graphene.String(required=True)

    success = graphene.Boolean()
    is_following = graphene.Boolean()
    follower_count = graphene.Int()

    @login_required
    def mutate(self, info, username):
        current_user = info.context.user
        
        try:
            target_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return FollowUser(success=False)
        
        if current_user == target_user:
            return FollowUser(success=False)
        
        # Toggle follow
        if current_user.following.filter(id=target_user.id).exists():
            current_user.following.remove(target_user)
            is_following = False
        else:
            current_user.following.add(target_user)
            is_following = True
        
        return FollowUser(
            success=True,
            is_following=is_following,
            follower_count=target_user.follower_count
        )


class ChangePassword(graphene.Mutation):
    """Change user password"""
    class Arguments:
        old_password = graphene.String(required=True)
        new_password = graphene.String(required=True)

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    @login_required
    def mutate(self, info, old_password, new_password):
        user = info.context.user
        errors = []
        
        if not user.check_password(old_password):
            errors.append("Current password is incorrect.")
            return ChangePassword(success=False, errors=errors)
        
        try:
            validate_password(new_password, user=user)
        except ValidationError as e:
            errors.extend(e.messages)
            return ChangePassword(success=False, errors=errors)
        
        user.set_password(new_password)
        user.save()
        
        return ChangePassword(success=True, errors=[])


import graphql_social_auth

class UserMutation(graphene.ObjectType):
    register_user = RegisterUser.Field()
    update_profile = UpdateProfile.Field()
    update_settings = UpdateSettings.Field()
    follow_user = FollowUser.Field()
    change_password = ChangePassword.Field()
    social_auth = graphql_social_auth.SocialAuthJWT.Field()
