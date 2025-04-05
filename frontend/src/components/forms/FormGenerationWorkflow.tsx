'use client';

import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { FormTemplateSelector } from './FormTemplateSelector';
import { FormPreview } from './FormPreview';
import { FormTemplate, GeneratedForm, pdfFormService } from '@/services/pdfFormService';

interface FormGenerationWorkflowProps {
  clientId: string;
  clientData: Record<string, any>;
  onComplete?: (batchId: string) => void;
}

const steps = ['Select Templates', 'Generate Forms', 'Preview & Download'];

export const FormGenerationWorkflow: React.FC<FormGenerationWorkflowProps> = ({
  clientId,
  clientData,
  onComplete
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplates, setSelectedTemplates] = useState<FormTemplate[]>([]);
  const [generatedForms, setGeneratedForms] = useState<GeneratedForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);

  const handleNext = async () => {
    if (activeStep === 0) {
      if (selectedTemplates.length === 0) {
        setError('Please select at least one template');
        return;
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      try {
        setLoading(true);
        setError(null);
        
        const batch = await pdfFormService.generateForms(
          clientId,
          selectedTemplates.map(t => t.id),
          clientData
        );
        
        setBatchId(batch.id);
        setGeneratedForms(batch.forms);
        setActiveStep(2);
        
        if (onComplete) {
          onComplete(batch.id);
        }
      } catch (err) {
        setError('Failed to generate forms');
        console.error('Error generating forms:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedTemplates([]);
    setGeneratedForms([]);
    setError(null);
    setBatchId(null);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <FormTemplateSelector
            selectedTemplates={selectedTemplates}
            onTemplatesSelected={setSelectedTemplates}
          />
        );
      case 1:
        return (
          <Box textAlign="center" p={3}>
            <Typography variant="h6" gutterBottom>
              Ready to Generate Forms
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Selected Templates: {selectedTemplates.length}
            </Typography>
          </Box>
        );
      case 2:
        return (
          <Box>
            {generatedForms.map((form) => (
              <Box key={form.id} mb={3}>
                <FormPreview form={form} />
              </Box>
            ))}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
        >
          Back
        </Button>
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button onClick={handleReset} variant="contained">
              Start Over
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Next'
              )}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}; 