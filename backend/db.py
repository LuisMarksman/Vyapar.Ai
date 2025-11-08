from sqlmodel import SQLModel, create_engine, Session, select

DATABASE_URL = "sqlite:///./app.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

def init_db():
    from . import models  # ensure models imported
    SQLModel.metadata.create_all(engine)
    with Session(engine) as s:
        from .models import User
        exists = s.exec(select(User)).first()
        if not exists:
            demo = User(name="Demo Co", phone="99999", business_type="manufacturing",
                        turnover_bracket="25L-1Cr", employees=8, industry_tags="textile")
            s.add(demo); s.commit()

def get_session():
    with Session(engine) as session:
        yield session
