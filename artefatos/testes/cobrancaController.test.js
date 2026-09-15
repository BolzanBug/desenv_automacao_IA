import { jest } from '@jest/globals';
import { launch, getAll, pay } from '../backend/src/controllers/cobrancaController.js';
import { Cobranca, Empresa } from '../backend/src/models/index.js';

jest.mock('../backend/src/models/index.js', () => ({
  Cobranca: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    count: jest.fn(),
    update: jest.fn()
  },
  Empresa: {
    findByPk: jest.fn(),
    update: jest.fn()
  }
}));

describe('Cobrança Controller - Módulo Financeiro & Contábil', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('launch()', () => {
    it('deve lançar uma cobrança com sucesso quando dados forem válidos (201)', async () => {
      req.body = {
        empresaId: 'uuid-empresa-1',
        numeroNf: 'NF-1001',
        numeroBoleto: 'BOL-1001',
        valor: '2500.00',
        dataVencimento: '2026-10-15'
      };

      Empresa.findByPk.mockResolvedValue({ id: 'uuid-empresa-1' });
      Cobranca.create.mockResolvedValue({
        id: 'uuid-cob-1',
        numero_nf: 'NF-1001',
        valor: 2500,
        status: 'PENDENTE'
      });

      await launch(req, res);

      expect(Empresa.findByPk).toHaveBeenCalledWith('uuid-empresa-1');
      expect(Cobranca.create).toHaveBeenCalledWith(
        expect.objectContaining({ numero_nf: 'NF-1001', valor: 2500 })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ invoiceId: 'uuid-cob-1' })
      );
    });

    it('deve retornar 400 se campos obrigatórios (empresaId, NF, valor, vencimento) faltarem', async () => {
      req.body = { numeroNf: 'NF-1001' }; // sem empresaId nem valor

      await launch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar 404 se a empresa informada não existir', async () => {
      req.body = {
        empresaId: 'uuid-fantasma',
        numeroNf: 'NF-1001',
        valor: 1000,
        dataVencimento: '2026-10-15'
      };

      Empresa.findByPk.mockResolvedValue(null);

      await launch(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('pay()', () => {
    it('deve confirmar pagamento, registrar data de baixa e verificar normalização de inadimplência (200)', async () => {
      req.params.id = 'uuid-cob-1';
      req.body = { observacao: 'Comprovante bancário conferido' };

      const mockCobranca = {
        id: 'uuid-cob-1',
        empresa_id: 'uuid-empresa-1',
        status: 'PENDENTE',
        save: jest.fn().mockResolvedValue(true)
      };

      Cobranca.findByPk.mockResolvedValue(mockCobranca);
      Cobranca.count.mockResolvedValue(0); // Nenhuma pendência restante
      Empresa.update.mockResolvedValue([1]);

      await pay(req, res);

      expect(mockCobranca.status).toBe('PAGO');
      expect(mockCobranca.save).toHaveBeenCalled();
      expect(Empresa.update).toHaveBeenCalledWith(
        { status_jornada: 'ATIVA' },
        expect.objectContaining({ where: expect.objectContaining({ status_jornada: 'INADIMPLENTE' }) })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 404 se a cobrança a ser liquidada não for encontrada', async () => {
      req.params.id = 'uuid-inexistente';
      Cobranca.findByPk.mockResolvedValue(null);

      await pay(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

