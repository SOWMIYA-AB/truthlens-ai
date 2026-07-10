from fastapi import APIRouter, Depends

from app.core.security import utc_now
from app.db.mongodb import get_database
from app.modules.auth.dependencies import get_current_user, require_roles
from app.modules.auth.service import serialize_user
from app.modules.users.schemas import UpdateProfileRequest

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return serialize_user(current_user)


@router.patch("/me")
async def update_profile(payload: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    database = get_database()
    await database.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"fullName": payload.fullName.strip(), "updatedAt": utc_now()}},
    )
    updated_user = await database.users.find_one({"_id": current_user["_id"]})
    return serialize_user(updated_user)


@router.get("")
async def list_users(_: dict = Depends(require_roles("admin"))):
    database = get_database()
    users = await database.users.find().sort("createdAt", -1).to_list(length=100)
    return [serialize_user(user) for user in users]

