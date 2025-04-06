import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormTemplateSelector } from '../FormTemplateSelector';
import { pdfFormService, FormTemplate } from '../../../services/pdfFormService';

// Mock the pdfFormService
jest.mock('../../../services/pdfFormService');

describe('FormTemplateSelector', () => {
    const mockTemplates: FormTemplate[] = [
        {
            id: '1',
            name: 'Broker Application Form',
            file_name: 'broker_application.pdf',
            description: 'Broker application form template',
            category: 'broker',
            template_file: 'broker_application.pdf',
            is_active: true,
            field_mappings: [
                {
                    id: '1',
                    pdf_field_name: 'fullName',
                    system_field_name: 'full_name'
                },
                {
                    id: '2',
                    pdf_field_name: 'fullNameChinese',
                    system_field_name: 'full_name_chinese'
                }
            ],
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
        },
        {
            id: '2',
            name: 'Broker FNA Form',
            file_name: 'broker_fna.pdf',
            description: 'Broker FNA form template',
            category: 'broker',
            template_file: 'broker_fna.pdf',
            is_active: true,
            field_mappings: [
                {
                    id: '3',
                    pdf_field_name: 'fullName',
                    system_field_name: 'full_name'
                },
                {
                    id: '4',
                    pdf_field_name: 'fullNameChinese',
                    system_field_name: 'full_name_chinese'
                }
            ],
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
        },
        {
            id: '3',
            name: 'Chubb Application Form',
            file_name: 'chubb_application.pdf',
            description: 'Chubb application form template',
            category: 'chubb',
            template_file: 'chubb_application.pdf',
            is_active: true,
            field_mappings: [
                {
                    id: '5',
                    pdf_field_name: 'fullName',
                    system_field_name: 'full_name'
                },
                {
                    id: '6',
                    pdf_field_name: 'fullNameChinese',
                    system_field_name: 'full_name_chinese'
                }
            ],
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
        },
        {
            id: '4',
            name: 'Chubb FNA Form',
            file_name: 'chubb_fna.pdf',
            description: 'Chubb FNA form template',
            category: 'chubb',
            template_file: 'chubb_fna.pdf',
            is_active: true,
            field_mappings: [
                {
                    id: '7',
                    pdf_field_name: 'fullName',
                    system_field_name: 'full_name'
                },
                {
                    id: '8',
                    pdf_field_name: 'fullNameChinese',
                    system_field_name: 'full_name_chinese'
                }
            ],
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
        }
    ];

    const mockOnTemplatesSelected = jest.fn();
    const mockSelectedTemplates: FormTemplate[] = [];

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock service methods
        (pdfFormService.getTemplates as jest.Mock).mockResolvedValue(mockTemplates);
    });

    it('renders the component', async () => {
        render(
            <FormTemplateSelector
                onTemplatesSelected={mockOnTemplatesSelected}
                selectedTemplates={mockSelectedTemplates}
            />
        );

        // Check if component renders
        expect(screen.getByText('Category')).toBeInTheDocument();

        // Wait for templates to load
        await waitFor(() => {
            expect(pdfFormService.getTemplates).toHaveBeenCalled();
        });

        // Check if templates are displayed
        expect(screen.getByText('Broker Application Form')).toBeInTheDocument();
        expect(screen.getByText('Broker FNA Form')).toBeInTheDocument();
        expect(screen.getByText('Chubb Application Form')).toBeInTheDocument();
        expect(screen.getByText('Chubb FNA Form')).toBeInTheDocument();
    });

    it('filters templates by category', async () => {
        render(
            <FormTemplateSelector
                onTemplatesSelected={mockOnTemplatesSelected}
                selectedTemplates={mockSelectedTemplates}
            />
        );

        // Wait for templates to load
        await waitFor(() => {
            expect(pdfFormService.getTemplates).toHaveBeenCalled();
        });

        // Select broker category
        const categorySelect = screen.getByLabelText('Category');
        fireEvent.mouseDown(categorySelect);
        const brokerOption = screen.getByText('Broker');
        fireEvent.click(brokerOption);

        // Check if only broker templates are displayed
        expect(screen.getByText('Broker Application Form')).toBeInTheDocument();
        expect(screen.getByText('Broker FNA Form')).toBeInTheDocument();
        expect(screen.queryByText('Chubb Application Form')).not.toBeInTheDocument();
        expect(screen.queryByText('Chubb FNA Form')).not.toBeInTheDocument();

        // Select chubb category
        fireEvent.mouseDown(categorySelect);
        const chubbOption = screen.getByText('Chubb');
        fireEvent.click(chubbOption);

        // Check if only chubb templates are displayed
        expect(screen.queryByText('Broker Application Form')).not.toBeInTheDocument();
        expect(screen.queryByText('Broker FNA Form')).not.toBeInTheDocument();
        expect(screen.getByText('Chubb Application Form')).toBeInTheDocument();
        expect(screen.getByText('Chubb FNA Form')).toBeInTheDocument();
    });

    it('handles template selection', async () => {
        render(
            <FormTemplateSelector
                onTemplatesSelected={mockOnTemplatesSelected}
                selectedTemplates={mockSelectedTemplates}
            />
        );

        // Wait for templates to load
        await waitFor(() => {
            expect(pdfFormService.getTemplates).toHaveBeenCalled();
        });

        // Select templates
        const brokerApplicationCard = screen.getByText('Broker Application Form').closest('div[role="button"]');
        const brokerFNACard = screen.getByText('Broker FNA Form').closest('div[role="button"]');
        fireEvent.click(brokerApplicationCard!);
        fireEvent.click(brokerFNACard!);

        // Check if onTemplatesSelected is called with selected templates
        expect(mockOnTemplatesSelected).toHaveBeenCalledWith([mockTemplates[0], mockTemplates[1]]);
    });

    it('handles template deselection', async () => {
        const selectedTemplates = [mockTemplates[0]];

        render(
            <FormTemplateSelector
                onTemplatesSelected={mockOnTemplatesSelected}
                selectedTemplates={selectedTemplates}
            />
        );

        // Wait for templates to load
        await waitFor(() => {
            expect(pdfFormService.getTemplates).toHaveBeenCalled();
        });

        // Deselect template
        const brokerApplicationCard = screen.getByText('Broker Application Form').closest('div[role="button"]');
        fireEvent.click(brokerApplicationCard!);

        // Check if onTemplatesSelected is called with empty array
        expect(mockOnTemplatesSelected).toHaveBeenCalledWith([]);
    });

    it('displays error message when templates fail to load', async () => {
        // Mock getTemplates to fail
        (pdfFormService.getTemplates as jest.Mock).mockRejectedValue(new Error('Failed to load templates'));

        render(
            <FormTemplateSelector
                onTemplatesSelected={mockOnTemplatesSelected}
                selectedTemplates={mockSelectedTemplates}
            />
        );

        // Check if error message is displayed
        await waitFor(() => {
            expect(screen.getByText('Failed to load form templates')).toBeInTheDocument();
        });
    });
}); 