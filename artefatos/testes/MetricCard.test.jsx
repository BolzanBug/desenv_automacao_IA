import { render, screen } from '@testing-library/react';
import MetricCard from '../frontend/src/components/MetricCard';

describe('MetricCard Component', () => {
  it('deve renderizar título, valor, subtítulo e indicador de tendência corretamente', () => {
    render(
      <MetricCard
        title="Afiliados Fechados"
        value={22}
        subtitle="Meta de 60 empresas"
        trend="+5 este mês"
        color="emerald"
      />
    );

    expect(screen.getByText('Afiliados Fechados')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.getByText('Meta de 60 empresas')).toBeInTheDocument();
    expect(screen.getByText('+5 este mês')).toBeInTheDocument();
  });
});

