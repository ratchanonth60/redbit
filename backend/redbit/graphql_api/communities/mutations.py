import graphene
from apps.communities.models import Community
from django.utils.text import slugify
from graphql_jwt.decorators import login_required

from .types import CommunityType


class CreateCommunity(graphene.Mutation):
    """Create new community"""
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String()

    success = graphene.Boolean()
    community = graphene.Field(CommunityType)
    errors = graphene.List(graphene.String)

    @login_required
    def mutate(self, info, name, description=""):
        user = info.context.user
        errors = []
        
        # Validation
        if len(name) < 3 or len(name) > 21:
            errors.append("Name must be between 3 and 21 characters.")
        
        # Check if exists
        slug = slugify(name)
        if Community.objects.filter(slug=slug).exists():
            errors.append("Community already exists.")
        
        if errors:
            return CreateCommunity(success=False, errors=errors)
        
        community = Community.objects.create(
            name=name,
            slug=slug,
            description=description,
            owner=user
        )
        
        # Auto-join creator
        community.members.add(user)
        
        return CreateCommunity(success=True, community=community, errors=[])


class JoinCommunity(graphene.Mutation):
    """Join/Leave community"""
    class Arguments:
        community_name = graphene.String(required=True)

    success = graphene.Boolean()
    is_member = graphene.Boolean()
    member_count = graphene.Int()

    @login_required
    def mutate(self, info, community_name):
        user = info.context.user
        
        try:
            community = Community.objects.get(name=community_name)
        except Community.DoesNotExist:
            return JoinCommunity(success=False)
        
        # Toggle membership
        if community.members.filter(id=user.id).exists():
            community.members.remove(user)
            is_member = False
        else:
            community.members.add(user)
            is_member = True
        
        return JoinCommunity(
            success=True,
            is_member=is_member,
            member_count=community.members.count()
        )


class UpdateCommunity(graphene.Mutation):
    """Update community (owner only)"""
    class Arguments:
        community_name = graphene.String(required=True)
        description = graphene.String()

    success = graphene.Boolean()
    community = graphene.Field(CommunityType)
    errors = graphene.List(graphene.String)

    @login_required
    def mutate(self, info, community_name, description=None):
        user = info.context.user
        
        try:
            community = Community.objects.get(name=community_name)
        except Community.DoesNotExist:
            return UpdateCommunity(
                success=False, 
                errors=["Community not found."]
            )
        
        # Check permission
        if community.owner != user and not user.is_staff:
            return UpdateCommunity(
                success=False, 
                errors=["You don't have permission."]
            )
        
        if description is not None:
            community.description = description
            community.save()
        
        return UpdateCommunity(success=True, community=community, errors=[])


class CommunityMutation(graphene.ObjectType):
    create_community = CreateCommunity.Field()
    join_community = JoinCommunity.Field()
    update_community = UpdateCommunity.Field()
