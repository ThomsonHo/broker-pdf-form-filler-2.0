'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { FormTemplateSelector } from './FormTemplateSelector';
import { FormPreview } from './FormPreview';
import { FormTemplate, GeneratedForm, pdfFormService, QuotaInfo } from '@/services/pdfFormService';

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
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);

  useEffect(() => {
    loadQuotaInfo();
  }, []);

  const loadQuotaInfo = async () => {
    try {
      const info = await pdfFormService.getQuotaInfo();
      setQuotaInfo(info);
    } catch (err) {
      console.error('Error loading quota info:', err);
    }
  };

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
        
        // Refresh quota info
        await loadQuotaInfo();
        
        if (onComplete) {
          onComplete(batch.id);
        }
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError('Daily form generation quota exceeded. Please try again tomorrow.');
        } else {
          setError('Failed to generate forms');
        }
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
      {quotaInfo && (
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Daily Form Generation Quota: {quotaInfo.daily_used} / {quotaInfo.daily_quota}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(quotaInfo.daily_used / quotaInfo.daily_quota) * 100} 
            color={quotaInfo.daily_remaining === 0 ? "error" : "primary"}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      )}

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