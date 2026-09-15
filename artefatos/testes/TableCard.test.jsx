import { render, screen } from '@testing-library/react';
import TableCard from '../frontend/src/components/TableCard';

describe('TableCard Component', () => {
  it('deve renderizar o estado vazio (EmptyState) quando não houver dados de empresas', () => {
    render(<TableCard data={[]} />);
    expect(screen.getByText('Nenhuma empresa afiliada cadastrada')).toBeInTheDocument();
  });

  it('deve renderizar a tabela corporativa com os dados da empresa e badges', () => {
    const mockData = [
      {
        id: '12345678-abcd-1111-2222-333344445555',
        razao_social: 'Pollen Tech Inovações',
        cnpj: '12.345.678/0001-90',
        tipo_empresa: 'PADRAO',
        nome_contato: 'Helena Santos',
        email: 'helena@pollentech.com',
        status_jornada: 'ATIVA',
        data_fim_vigencia: '2027-12-31',
        diasRestantesVigencia: 180
      }
    ];

    render(<TableCard data={mockData} />);

    expect(screen.getByText('Pollen Tech Inovações')).toBeInTheDocument();
    expect(screen.getByText('12.345.678/0001-90')).toBeInTheDocument();
    expect(screen.getByText('Helena Santos')).toBeInTheDocument();
    expect(screen.getByText('helena@pollentech.com')).toBeInTheDocument();
    expect(screen.getByText('Ativa')).toBeInTheDocument();
    expect(screen.getByText('180 dias restantes')).toBeInTheDocument();
    expect(screen.getByText('Ver Ficha 360°')).toBeInTheDocument();
  });
});
