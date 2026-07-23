CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- TEMPLATE STATUS
-- ============================================================

CREATE TABLE template_status (
    id SMALLINT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL
);

INSERT INTO template_status (id, code, name)
VALUES
    (1, 'draft',     'Draft'),
    (2, 'published', 'Published'),
    (3, 'archived',  'Archived');


-- ============================================================
-- ITEM STATUS
-- ============================================================

CREATE TABLE item_status (
    id SMALLINT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL
);

INSERT INTO item_status (id, code, name)
VALUES
    (1, 'draft',       'Draft'),
    (2, 'in_progress', 'In Progress'),
    (3, 'submitted',   'Submitted'),
    (4, 'cancelled',   'Cancelled'),
    (5, 'expired',     'Expired');


-- ============================================================
-- TEMPLATE
-- ============================================================

CREATE TABLE template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Microsoft Entra Object ID
    owner_user_id UUID NOT NULL,

    name VARCHAR(200) NOT NULL,

    slug VARCHAR(200) NOT NULL,

    description TEXT,

    template_status_id SMALLINT NOT NULL DEFAULT 1,

    current_version INTEGER NOT NULL DEFAULT 1,

    settings JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    published_at TIMESTAMPTZ,

    CONSTRAINT fk_template_status
        FOREIGN KEY (template_status_id)
        REFERENCES template_status(id),

    CONSTRAINT uq_template_owner_slug
        UNIQUE (owner_user_id, slug),

    CONSTRAINT chk_template_current_version
        CHECK (current_version > 0)
);


-- ============================================================
-- TEMPLATE VERSION
-- ============================================================

CREATE TABLE template_version (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    template_id UUID NOT NULL,

    version INTEGER NOT NULL,

    -- Complete dynamic form definition
    definition JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_by_user_id UUID NOT NULL,

    CONSTRAINT fk_template_version_template
        FOREIGN KEY (template_id)
        REFERENCES template(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_template_version
        UNIQUE (template_id, version),

    CONSTRAINT chk_template_version
        CHECK (version > 0)
);


-- ============================================================
-- ITEM
-- ============================================================

CREATE TABLE item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Exact template version this item was created from
    template_version_id UUID NOT NULL,

    -- Nullable so anonymous/public use is possible later
    created_by_user_id UUID,

    item_status_id SMALLINT NOT NULL DEFAULT 1,

    -- User-entered values
    data JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Calculated / workflow output
    result JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    submitted_at TIMESTAMPTZ,

    CONSTRAINT fk_item_template_version
        FOREIGN KEY (template_version_id)
        REFERENCES template_version(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_item_status
        FOREIGN KEY (item_status_id)
        REFERENCES item_status(id)
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX ix_template_owner_user_id
    ON template(owner_user_id);

CREATE INDEX ix_template_status
    ON template(template_status_id);


CREATE INDEX ix_template_version_template_id
    ON template_version(template_id);


CREATE INDEX ix_item_template_version_id
    ON item(template_version_id);

CREATE INDEX ix_item_created_by_user_id
    ON item(created_by_user_id);

CREATE INDEX ix_item_status
    ON item(item_status_id);

CREATE INDEX ix_item_created_at
    ON item(created_at DESC);