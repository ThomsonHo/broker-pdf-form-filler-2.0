import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';

interface Validation {
  type: string;
  message: string;
  value?: any;
}

interface Relationship {
  type: string;
  targetField: string;
  condition?: {
    field: string;
    operator: string;
    value: any;
  };
}

interface FieldFormProps {
  fieldType: string;
  validation?: Validation;
  relationships?: Relationship;
  onValidationChange: (validation: Validation | undefined) => void;
  onRelationshipsChange: (relationships: Relationship | undefined) => void;
}

const VALIDATION_TYPES = [
  'required',
  'min',
  'max',
  'minLength',
  'maxLength',
  'pattern',
  'email',
  'url',
  'phone',
  'date',
  'number',
  'integer',
  'positive',
  'negative',
  'between',
  'in',
  'notIn',
  'custom',
] as const;

const RELATIONSHIP_TYPES = [
  'depends_on',
  'affects',
  'validates',
  'calculates',
  'transforms',
] as const;

const OPERATORS = [
  'equals',
  'notEquals',
  'contains',
  'notContains',
  'greaterThan',
  'lessThan',
  'greaterThanOrEqual',
  'lessThanOrEqual',
  'in',
  'notIn',
  'between',
  'startsWith',
  'endsWith',
  'matches',
  'custom',
] as const;

export const FieldForm: React.FC<FieldFormProps> = ({
  fieldType,
  validation,
  relationships,
  onValidationChange,
  onRelationshipsChange,
}) => {
  const [showValidation, setShowValidation] = useState(!!validation);
  const [showRelationships, setShowRelationships] = useState(!!relationships);

  const handleValidationChange = (field: keyof Validation, value: any) => {
    onValidationChange({
      ...validation,
      [field]: value,
    } as Validation);
  };

  const handleRelationshipChange = (field: keyof Relationship, value: any) => {
    onRelationshipsChange({
      ...relationships,
      [field]: value,
    } as Relationship);
  };

  const handleConditionChange = (field: keyof NonNullable<Relationship['condition']>, value: any) => {
    onRelationshipsChange({
      ...relationships,
      condition: {
        ...relationships?.condition,
        [field]: value,
      },
    } as Relationship);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Validation Rules</h3>
          <Switch
            checked={showValidation}
            onCheckedChange={setShowValidation}
          />
        </div>

        {showValidation && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="validationType">Validation Type</Label>
              <Select
                value={validation?.type || ''}
                onValueChange={(value: string) => handleValidationChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select validation type" />
                </SelectTrigger>
                <SelectContent>
                  {VALIDATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="validationMessage">Error Message</Label>
              <Input
                id="validationMessage"
                value={validation?.message || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleValidationChange('message', e.target.value)}
                placeholder="Enter error message"
              />
            </div>

            {['min', 'max', 'minLength', 'maxLength', 'between'].includes(validation?.type || '') && (
              <div>
                <Label htmlFor="validationValue">Value</Label>
                <Input
                  id="validationValue"
                  type="number"
                  value={validation?.value || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleValidationChange('value', e.target.value)}
                  placeholder="Enter value"
                />
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Field Relationships</h3>
          <Switch
            checked={showRelationships}
            onCheckedChange={setShowRelationships}
          />
        </div>

        {showRelationships && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="relationshipType">Relationship Type</Label>
              <Select
                value={relationships?.type || ''}
                onValueChange={(value: string) => handleRelationshipChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetField">Target Field</Label>
              <Input
                id="targetField"
                value={relationships?.targetField || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRelationshipChange('targetField', e.target.value)}
                placeholder="Enter target field name"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Condition</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRelationshipChange('condition', undefined)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {relationships?.condition && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="conditionField">Field</Label>
                    <Input
                      id="conditionField"
                      value={relationships.condition.field || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleConditionChange('field', e.target.value)}
                      placeholder="Enter field name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="conditionOperator">Operator</Label>
                    <Select
                      value={relationships.condition.operator || ''}
                      onValueChange={(value: string) => handleConditionChange('operator', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((op) => (
                          <SelectItem key={op} value={op}>
                            {op.charAt(0).toUpperCase() + op.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="conditionValue">Value</Label>
                    <Input
                      id="conditionValue"
                      value={relationships.condition.value || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleConditionChange('value', e.target.value)}
                      placeholder="Enter value"
                    />
                  </div>
                </div>
              )}

              {!relationships?.condition && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleRelationshipChange('condition', {
                      field: '',
                      operator: 'equals',
                      value: '',
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Condition
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}; 