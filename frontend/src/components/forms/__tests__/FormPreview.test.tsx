import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormPreview } from '../FormPreview';
import { pdfFormService, GeneratedForm } from '../../../services/pdfFormService';

// Mock the pdfFormService
jest.mock('../../../services/pdfFormService');

describe('FormPreview', () => {
    const mockForm: GeneratedForm = {
        id: '1',
        template: '1',
        template_name: 'Broker Application Form',
        status: 'completed',
        error_message: '',
        created_at: '2023-01-01T00:00:00Z',
        download_url: 'test_template_filled.pdf'
    };

    const mockOnDownload = jest.fn();

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock service methods
        (pdfFormService.downloadForm as jest.Mock).mockResolvedValue(new Blob(['test'], { type: 'application/pdf' }));
    });

    it('renders the component', () => {
        render(<FormPreview form={mockForm} onDownload={mockOnDownload} />);

        // Check if component renders
        expect(screen.getByText('Broker Application Form')).toBeInTheDocument();

        // Check if zoom buttons are displayed
        expect(screen.getByLabelText('Zoom Out')).toBeInTheDocument();
        expect(screen.getByLabelText('Zoom In')).toBeInTheDocument();

        // Check if download button is displayed
        expect(screen.getByLabelText('Download')).toBeInTheDocument();
    });

    it('handles zoom in', () => {
        render(<FormPreview form={mockForm} onDownload={mockOnDownload} />);

        // Click zoom in button
        const zoomInButton = screen.getByLabelText('Zoom In');
        fireEvent.click(zoomInButton);

        // Check if zoom in button is disabled
        expect(zoomInButton).toBeDisabled();
    });

    it('handles zoom out', () => {
        render(<FormPreview form={mockForm} onDownload={mockOnDownload} />);

        // Click zoom out button
        const zoomOutButton = screen.getByLabelText('Zoom Out');
        fireEvent.click(zoomOutButton);

        // Check if zoom out button is disabled
        expect(zoomOutButton).toBeDisabled();
    });

    it('handles download', async () => {
        render(<FormPreview form={mockForm} onDownload={mockOnDownload} />);

        // Click download button
        const downloadButton = screen.getByLabelText('Download');
        fireEvent.click(downloadButton);

        // Check if downloadForm is called
        await waitFor(() => {
            expect(pdfFormService.downloadForm).toHaveBeenCalledWith('1');
        });

        // Check if onDownload is called
        expect(mockOnDownload).toHaveBeenCalled();
    });

    it('displays error message when download fails', async () => {
        // Mock downloadForm to fail
        (pdfFormService.downloadForm as jest.Mock).mockRejectedValue(new Error('Failed to download form'));

        render(<FormPreview form={mockForm} onDownload={mockOnDownload} />);

        // Click download button
        const downloadButton = screen.getByLabelText('Download');
        fireEvent.click(downloadButton);

        // Check if error is logged
        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('Error downloading form:', expect.any(Error));
        });
    });

    it('displays error message when PDF fails to load', () => {
        // Mock console.error
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        render(<FormPreview form={mockForm} onDownload={mockOnDownload} />);

        // Simulate PDF load error
        const document = screen.getByTestId('document');
        fireEvent.error(document, new Error('Failed to load PDF'));

        // Check if error message is displayed
        expect(screen.getByText('Failed to load PDF document')).toBeInTheDocument();

        // Restore console.error
        consoleSpy.mockRestore();
    });
}); 