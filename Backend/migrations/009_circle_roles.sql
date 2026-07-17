-- Add owner_id to circles referencing users
ALTER TABLE circles ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Set creator as owner for existing circles
UPDATE circles SET owner_id = created_by WHERE owner_id IS NULL;

-- Update circle_members roles: Owner of circle gets role 'owner'
UPDATE circle_members cm
SET role = 'owner'
FROM circles c
WHERE cm.circle_id = c.id AND cm.user_id = c.owner_id;
