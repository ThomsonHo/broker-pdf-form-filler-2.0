import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormBatchList } from '../FormBatchList';
import { pdfFormService } from '../../../services/pdfFormService';

// Mock the pdfFormService
jest.mock('../../../services/pdfFormService');

describe('FormBatchList', () => {
    const mockBatches = [
        {
            id: 1,
            client: {
                id: 1,
                name: 'Test Client',
                full_name: 'Test Client',
                full_name_chinese: '測試客戶'
            },
            insurer: 'Test Insurer',
            templates: [
                {
                    id: 1,
                    name: 'Test Template',
                    file_name: 'test_template.pdf',
                    description: 'Test template for unit tests',
                    category: 'broker',
                    is_active: true
                }
            ],
            status: 'completed',
            created_at: '2023-01-01T00:00:00Z',
            forms: [
                {
                    id: 1,
                    template: {
                        id: 1,
                        name: 'Test Template',
                        file_name: 'test_template.pdf',
                        description: 'Test template for unit tests',
                        category: 'broker',
                        is_active: true
                    },
                    status: 'completed',
                    created_at: '2023-01-01T00:00:00Z',
                    form_file: 'test_template_filled.pdf'
                }
            ]
        }
    ];

    const mockQuotaInfo = {
        daily_quota: 10,
        daily_used: 1,
        daily_remaining: 9
    };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock service methods
        (pdfFormService.getBatches as jest.Mock).mockResolvedValue(mockBatches);
        (pdfFormService.getQuotaInfo as jest.Mock).mockResolvedValue(mockQuotaInfo);
    });

    it('renders the component', async () => {
        render(<FormBatchList />);

        // Check if component renders
        expect(screen.getByText('Form Generation Batches')).toBeInTheDocument();

        // Wait for batches to load
        await waitFor(() => {
            expect(pdfFormService.getBatches).toHaveBeenCalled();
        });

        // Check if batches are displayed
        expect(screen.getByText('Test Client')).toBeInTheDocument();
        expect(screen.getByText('Test Insurer')).toBeInTheDocument();
        expect(screen.getByText('Test Template')).toBeInTheDocument();

        // Check if quota info is displayed
        expect(screen.getByText('Daily Form Generation Quota')).toBeInTheDocument();
        expect(screen.getByText('1 / 10')).toBeInTheDocument();
    });

    it('handles batch deletion', async () => {
        // Mock delete batch method
        (pdfFormService.deleteBatch as jest.Mock).mockResolvedValue({});

        render(<FormBatchList />);

        // Wait for batches to load
        await waitFor(() => {
            expect(pdfFormService.getBatches).toHaveBeenCalled();
        });

        // Click delete button
        const deleteButton = screen.getByLabelText('Delete batch');
        fireEvent.click(deleteButton);

        // Confirm deletion
        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        // Check if batch is deleted
        await waitFor(() => {
            expect(pdfFormService.deleteBatch).toHaveBeenCalledWith(1);
        });

        // Check if batches are refreshed
        await waitFor(() => {
            expect(pdfFormService.getBatches).toHaveBeenCalled();
        });
    });

    it('handles form download', async () => {
        // Mock download form method
        (pdfFormService.downloadForm as jest.Mock).mockResolvedValue(new Blob(['test'], { type: 'application/pdf' }));

        render(<FormBatchList />);

        // Wait for batches to load
        await waitFor(() => {
            expect(pdfFormService.getBatches).toHaveBeenCalled();
        });

        // Click download button
        const downloadButton = screen.getByLabelText('Download form');
        fireEvent.click(downloadButton);

        // Check if form is downloaded
        await waitFor(() => {
            expect(pdfFormService.downloadForm).toHaveBeenCalledWith(1);
        });
    });

    it('displays error message when batch deletion fails', async () => {
        // Mock delete batch method to fail
        (pdfFormService.deleteBatch as jest.Mock).mockRejectedValue(new Error('Failed to delete batch'));

        render(<FormBatchList />);

        // Wait for batches to load
        await waitFor(() => {
            expect(pdfFormService.getBatches).toHaveBeenCalled();
        });

        // Click delete button
        const deleteButton = screen.getByLabelText('Delete batch');
        fireEvent.click(deleteButton);

        // Confirm deletion
        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        // Check if error message is displayed
        await waitFor(() => {
            expect(screen.getByText('Failed to delete batch')).toBeInTheDocument();
        });
    });

    it('displays error message when form download fails', async () => {
        // Mock download form method to fail
        (pdfFormService.downloadForm as jest.Mock).mockRejectedValue(new Error('Failed to download form'));

        render(<FormBatchList />);

        // Wait for batches to load
        await waitFor(() => {
            expect(pdfFormService.getBatches).toHaveBeenCalled();
        });

        // Click download button
        const downloadButton = screen.getByLabelText('Download form');
        fireEvent.click(downloadButton);

        // Check if error message is displayed
        await waitFor(() => {
            expect(screen.getByText('Failed to download form')).toBeInTheDocument();
        });
    });
}); 