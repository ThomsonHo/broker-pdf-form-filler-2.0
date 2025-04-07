export interface ValidationRule {
  rule_type: string;
  pattern?: string;
  min?: number;
  max?: number;
  message: string;
}

export interface RelationshipRule {
  related_field: string;
  relationship_type: string;
  conditions: Record<string, any>;
}

export interface StandardizedField {
  id: string;
  name: string;
  label: string;
  llm_guide?: string | null;
  is_required?: boolean;
  field_category: string;
  display_category: string;
  field_type: string;
  field_definition?: string | null;
  has_validation?: boolean;
  validation_rules?: ValidationRule[];
  has_relationship?: boolean;
  relationship_rules?: RelationshipRule[];
  options?: Record<string, any> | null;
  default_value?: string | null;
  placeholder?: string | null;
  help_text?: string | null;
  is_active?: boolean;
  is_system?: boolean;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface StandardizedFieldCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStandardizedFieldData {
  name: string;
  label: string;
  llm_guide?: string | null;
  is_required?: boolean;
  field_category: string;
  display_category: string;
  field_type: string;
  field_definition?: string | null;
  has_validation?: boolean;
  validation_rules?: ValidationRule[];
  has_relationship?: boolean;
  relationship_rules?: RelationshipRule[];
  options?: Record<string, any> | null;
  default_value?: string | null;
  placeholder?: string | null;
  help_text?: string | null;
  is_active?: boolean;
  is_system?: boolean;
  metadata?: Record<string, any> | null;
}

export interface UpdateStandardizedFieldData extends Partial<CreateStandardizedFieldData> {} 