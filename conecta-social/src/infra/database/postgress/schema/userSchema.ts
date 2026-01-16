export const CREATE_TABLE_USER = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    crm VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`

export const createNewUserAdmin = `
INSERT INTO users (full_name, email, password, crm, role, is_active, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
ON CONFLICT (email) DO NOTHING
RETURNING *;
`