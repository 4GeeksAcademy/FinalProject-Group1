from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List
from datetime import datetime, timezone
from typing import Optional

db = SQLAlchemy()

class User(db.Model):
    id_usuario: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    fullname: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    rol: Mapped[str] = mapped_column(String(20), nullable = False, default= "usuario")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now (timezone.utc), nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    salt: Mapped[str] = mapped_column(String(50), nullable = False)
    foto_perfil: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable = True)


    def __repr__(self):
        return f'<User {self.username}>'

    def serialize(self):
        return {
            "id": self.id_usuario,
            "username": self.username,
            "email": self.email,
            "fullname": self.fullname,
            "rol": self.rol,
            "is_Active": self.is_active,
            "image": self.foto_perfil
        }