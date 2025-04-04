import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { QuickAccessPanel } from '../QuickAccessPanel';
import theme from '../../../theme';

interface QuickLink {
  id: number;
  title: string;
  url: string;
  icon: string;
}

describe('QuickAccessPanel', () => {
  const mockLinks: QuickLink[] = [
    {
      id: 1,
      title: 'New Client',
      url: '/clients/new',
      icon: 'person_add',
    },
    {
      id: 2,
      title: 'Generate Form',
      url: '/forms/new',
      icon: 'add_circle',
    },
  ];

  const renderQuickAccessPanel = (links?: QuickLink[]) => {
    return render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <QuickAccessPanel links={links || []} />
        </MemoryRouter>
      </ThemeProvider>
    );
  };

  it('renders quick access links', () => {
    renderQuickAccessPanel(mockLinks);

    expect(screen.getByText('New Client')).toBeInTheDocument();
    expect(screen.getByText('Generate Form')).toBeInTheDocument();
    expect(screen.getByText('person_add')).toBeInTheDocument();
    expect(screen.getByText('add_circle')).toBeInTheDocument();
  });

  it('renders empty panel when no links provided', () => {
    renderQuickAccessPanel();

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders empty panel with empty links array', () => {
    renderQuickAccessPanel([]);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders links with correct href attributes', () => {
    renderQuickAccessPanel(mockLinks);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/clients/new');
    expect(links[1]).toHaveAttribute('href', '/forms/new');
  });
}); 