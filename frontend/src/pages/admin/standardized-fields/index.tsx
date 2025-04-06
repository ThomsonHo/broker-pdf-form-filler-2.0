import React, { useState, useEffect } from 'react';
import { Layout } from '@/layouts/AdminLayout';
import { FieldList } from '@/components/admin/StandardizedFields/FieldList';
import { FieldBuilder } from '@/components/admin/StandardizedFields/FieldBuilder';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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

const StandardizedFieldsPage: React.FC = () => {
  const [fields, setFields] = useState<StandardizedField[]>([]);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<StandardizedField | null>(null);

  useEffect(() => {
    // TODO: Fetch fields from API
    // This will be implemented when the backend is ready
  }, []);

  const handleFieldSelect = (field: StandardizedField) => {
    setSelectedField(field);
    setIsBuilderOpen(true);
  };

  const handleFieldSave = async (field: StandardizedField) => {
    // TODO: Implement save functionality when backend is ready
    if (selectedField) {
      setFields(fields.map(f => f.id === field.id ? field : f));
    } else {
      setFields([...fields, { ...field, id: Date.now().toString() }]);
    }
    setIsBuilderOpen(false);
    setSelectedField(null);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Standardized Fields</h1>
          <Button
            onClick={() => {
              setSelectedField(null);
              setIsBuilderOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <FieldList
              fields={fields}
              onFieldSelect={handleFieldSelect}
            />
          </div>
          <div className="lg:col-span-2">
            {isBuilderOpen && (
              <FieldBuilder
                field={selectedField}
                onSave={handleFieldSave}
                onCancel={() => {
                  setIsBuilderOpen(false);
                  setSelectedField(null);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StandardizedFieldsPage; 