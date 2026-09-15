import { render, screen } from '@testing-library/react';
import Badge from '../frontend/src/components/Badge';

describe('Badge Component', () => {
  it('deve renderizar status ATIVA com label correspondente e classes esmeralda', () => {
    const { container } = render(<Badge status="ATIVA" />);
    expect(screen.getByText('Ativa')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-emerald-100');
    expect(container.firstChild).toHaveClass('text-emerald-800');
  });

  it('deve renderizar status INADIMPLENTE com classes rose de alerta', () => {
    const { container } = render(<Badge status="INADIMPLENTE" />);
    expect(screen.getByText('Inadimplente')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-rose-100');
  });

  it('deve renderizar status financeiro PAGO corretamente', () => {
    const { container } = render(<Badge status="PAGO" />);
    expect(screen.getByText('Pago')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-emerald-100');
  });

  it('deve renderizar status financeiro ATRASADO corretamente', () => {
    const { container } = render(<Badge status="ATRASADO" />);
    expect(screen.getByText('Atrasado')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-rose-100');
  });

  it('deve renderizar modalidade INTERNACIONAL corretamente', () => {
    render(<Badge status="INTERNACIONAL" type="tipo" />);
    expect(screen.getByText('Internacional')).toBeInTheDocument();
  });
});

