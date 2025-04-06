import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FieldForm } from './FieldForm';

interface StandardizedField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  validation?: {
    type: string;
    message: string;
    value?: any;
  };
  relationships?: {
    type: string;
    targetField: string;
    condition?: {
      field: string;
      operator: string;
      value: any;
    };
  };
}

interface FieldBuilderProps {
  field?: StandardizedField | null;
  onSave: (field: StandardizedField) => void;
  onCancel: () => void;
}

const FIELD_TYPES = [
  'text',
  'number',
  'date',
  'select',
  'multiselect',
  'checkbox',
  'radio',
  'file',
  'textarea',
  'email',
  'phone',
  'address',
  'currency',
  'percentage',
  'url',
  'password',
  'time',
  'datetime',
  'color',
  'range',
  'tel',
  'search',
  'time',
  'week',
  'month',
  'datetime-local',
] as const;

export const FieldBuilder: React.FC<FieldBuilderProps> = ({
  field,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<StandardizedField>({
    id: field?.id || '',
    name: field?.name || '',
    label: field?.label || '',
    type: field?.type || 'text',
    required: field?.required || false,
    validation: field?.validation || undefined,
    relationships: field?.relationships || undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Field Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., first_name"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Use snake_case for field names
            </p>
          </div>

          <div>
            <Label htmlFor="label">Display Label</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., First Name"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Field Type</Label>
            <Select value={formData.type} onValueChange={(value: string) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={formData.required}
              onCheckedChange={(checked: boolean) =>
                setFormData({ ...formData, required: checked })
              }
            />
            <Label htmlFor="required">Required Field</Label>
          </div>
        </div>

        <FieldForm
          fieldType={formData.type}
          validation={formData.validation}
          relationships={formData.relationships}
          onValidationChange={(validation) =>
            setFormData({ ...formData, validation })
          }
          onRelationshipsChange={(relationships) =>
            setFormData({ ...formData, relationships })
          }
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Field</Button>
        </div>
      </form>
    </Card>
  );
}; 