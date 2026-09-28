CREATE TABLE food (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER REFERENCES app_user(id),
    name VARCHAR NOT NULL,
    brand VARCHAR,
    source VARCHAR NOT NULL CHECK (source IN ('OFF', 'CIQUAL', 'USER')),
    external_id VARCHAR,
    barcode VARCHAR,
    reference_unit VARCHAR NOT NULL CHECK (reference_unit IN ('g', 'ml')),
    calories_per_100 NUMERIC CHECK (calories_per_100 >= 0),
    protein_per_100 NUMERIC CHECK (protein_per_100 >= 0),
    carbs_per_100 NUMERIC CHECK (carbs_per_100 >= 0),
    fat_per_100 NUMERIC CHECK (fat_per_100 >= 0),
    fiber_per_100 NUMERIC CHECK (fiber_per_100 >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (
    (source = 'USER' AND user_id IS NOT NULL)
    OR
    (source IN ('OFF', 'CIQUAL') AND user_id IS NULL)
    )
);

CREATE TABLE food_portion (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    food_id INTEGER NOT NULL REFERENCES food(id),
    label VARCHAR NOT NULL,
    equivalent_quantity NUMERIC NOT NULL CHECK (equivalent_quantity > 0),

    UNIQUE (food_id, id)
);

CREATE TABLE journal_entry (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES app_user(id),
    food_id INTEGER NOT NULL REFERENCES food(id),
    entry_date DATE NOT NULL,
    meal_type VARCHAR NOT NULL CHECK (
        meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK')
    ),
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    quantity_mode VARCHAR NOT NULL CHECK (
        quantity_mode IN ('REFERENCE', 'PORTION')
    ),
    reference_quantity_snapshot NUMERIC NOT NULL
        CHECK (reference_quantity_snapshot > 0),
    food_portion_id INTEGER,
    label VARCHAR NOT NULL,
    calories_snapshot NUMERIC CHECK (calories_snapshot >= 0),
    protein_snapshot NUMERIC CHECK (protein_snapshot >= 0),
    carbs_snapshot NUMERIC CHECK (carbs_snapshot >= 0),
    fat_snapshot NUMERIC CHECK (fat_snapshot >= 0),
    fiber_snapshot NUMERIC CHECK (fiber_snapshot >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (
    (quantity_mode = 'REFERENCE' AND food_portion_id IS NULL)
    OR
    (quantity_mode = 'PORTION' AND food_portion_id IS NOT NULL)
    ),

    FOREIGN KEY (food_id, food_portion_id)
    REFERENCES food_portion(food_id, id)
);
