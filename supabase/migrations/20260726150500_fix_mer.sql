-- Clean up invalid tenant_ids in knowledge_units (just delete them since they are orphans)
DELETE FROM knowledge_units WHERE tenant_id NOT IN (SELECT id FROM tenants);

-- Now add the foreign keys for all tables missing it to fix the MER
ALTER TABLE knowledge_units 
ADD CONSTRAINT fk_knowledge_units_tenant 
FOREIGN KEY (tenant_id) 
REFERENCES tenants(id) 
ON DELETE CASCADE;

ALTER TABLE uc_pmest_signatures 
ADD CONSTRAINT fk_uc_pmest_signatures_tenant 
FOREIGN KEY (tenant_id) 
REFERENCES tenants(id) 
ON DELETE CASCADE;

ALTER TABLE uc_subgroups 
ADD CONSTRAINT fk_uc_subgroups_tenant 
FOREIGN KEY (tenant_id) 
REFERENCES tenants(id) 
ON DELETE CASCADE;
