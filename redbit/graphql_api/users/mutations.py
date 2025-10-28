import graphene
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode

from tasks.email import send_confirmation_email_task
from .schema import UserType  # Import UserType ที่เราสร้างไว้

User = get_user_model()


class RegisterUser(graphene.Mutation):
    """
    Mutation สำหรับสมัครสมาชิกใหม่
    จะเรียก Background Task ให้ส่งอีเมลยืนยัน
    """

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
        if User.objects.filter(username=username).exists():
            errors.append("Username already exists.")

        if User.objects.filter(email=email).exists():
            errors.append("Email already exists.")

        if errors:
            return cls(success=False, errors=errors)

        try:
            user = User.objects.create_user(username=username, email=email, password=password, is_active=False)

            # --- 4. เรียกใช้ Task แบบ Asynchronous ---
            # .defer() จะส่งงานนี้ให้ Worker ทันที
            send_confirmation_email_task.delay(user_id=user.id)
            # ----------------------------------------

            return cls(success=True, user=user)
        except Exception as e:
            return cls(success=False, errors=[str(e)])


# --- 5. อัปเดต SendConfirmationEmail (ตอนนี้ทำหน้าที่ "ส่งซ้ำ") ---
class SendConfirmationEmail(graphene.Mutation):
    """
    Mutation สำหรับ "ส่งอีเมลยืนยันตัวตนซ้ำ"
    """

    class Arguments:
        email = graphene.String(required=True)

    success = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, email):
        try:
            user = User.objects.get(email=email, is_active=False)
        except User.DoesNotExist:
            # ไม่เจอ User หรือ User Active ไปแล้ว
            # เราควรตอบ success เสมอ เพื่อความปลอดภัย
            return cls(success=True)

        # --- เรียกใช้ Task แบบ Asynchronous ---
        send_confirmation_email_task.delay(user_id=user.id)
        # -------------------------------------

        return cls(success=True)


# --- (VerifyEmail Mutation ไม่มีการเปลี่ยนแปลง) ---
class VerifyEmail(graphene.Mutation):
    class Arguments:
        uidb64 = graphene.String(required=True)
        token = graphene.String(required=True)

    success = graphene.Boolean()
    user = graphene.Field(UserType)

    @classmethod
    def mutate(cls, root, info, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.email_verified = True
            user.save()
            return cls(success=True, user=user)

        return cls(success=False, user=None)


# --- (คลาส UserMutation หลัก ไม่มีการเปลี่ยนแปลง) ---
class UserMutation(graphene.ObjectType):
    register_user = RegisterUser.Field()
    send_confirmation_email = SendConfirmationEmail.Field()
    verify_email = VerifyEmail.Field()
