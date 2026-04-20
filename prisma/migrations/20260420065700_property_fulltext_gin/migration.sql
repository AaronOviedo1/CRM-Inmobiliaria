-- Full-text search trigram index para Property.
-- Acelera búsquedas `ILIKE '%hermosillo%'` / similarity() sobre title, description, neighborhood.
-- Alcance: todos los tenants (queries reales siguen filtrando por organizationId por el índice compuesto).

CREATE INDEX IF NOT EXISTS "Property_fulltext_trgm_idx"
ON "Property"
USING GIN (
  (
    COALESCE("title", '') || ' ' ||
    COALESCE("description", '') || ' ' ||
    COALESCE("neighborhood", '') || ' ' ||
    COALESCE("city", '')
  ) gin_trgm_ops
);
