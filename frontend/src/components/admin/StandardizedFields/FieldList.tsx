import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

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

interface FieldListProps {
  fields: StandardizedField[];
  onFieldSelect: (field: StandardizedField) => void;
}

export const FieldList: React.FC<FieldListProps> = ({ fields, onFieldSelect }) => {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Fields</h2>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-2">
          {fields.map((field) => (
            <div
              key={field.id}
              onClick={() => onFieldSelect(field)}
              className="p-3 rounded-lg border border-gray-200 hover:border-primary cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{field.label}</h3>
                  <p className="text-sm text-gray-500">{field.name}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{field.type}</Badge>
                  {field.required && (
                    <Badge variant="secondary">Required</Badge>
                  )}
                </div>
              </div>
              {field.relationships && (
                <div className="mt-2 text-sm text-gray-500">
                  <span className="font-medium">Related to:</span> {field.relationships.targetField}
                </div>
              )}
            </div>
          ))}
          {fields.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No fields defined yet
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}; 