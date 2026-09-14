CREATE TABLE app_user (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE nutrition_goal (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES app_user(id),
    daily_calories NUMERIC NOT NULL CHECK (daily_calories > 0),
    protein_percentage NUMERIC NOT NULL CHECK (protein_percentage >= 0),
    carbs_percentage NUMERIC NOT NULL CHECK (carbs_percentage >= 0),
    fat_percentage NUMERIC NOT NULL CHECK (fat_percentage >= 0),
    fiber_grams NUMERIC NOT NULL CHECK (fiber_grams >= 0),
    effective_from DATE NOT NULL,

    CHECK (
        protein_percentage + carbs_percentage + fat_percentage = 100
        )
);
