import { jest } from '@jest/globals';
import { getAll, allocate, create } from '../backend/src/controllers/espacoController.js';
import { EspacoFisico, Empresa } from '../backend/src/models/index.js';

jest.mock('../backend/src/models/index.js', () => ({
  EspacoFisico: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  },
  Empresa: {
    findByPk: jest.fn()
  }
}));

describe('Espaço Físico Controller - Infraestrutura e Ocupação', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('allocate()', () => {
    it('deve alocar espaço para uma empresa com sucesso e marcar como OCUPADO (200)', async () => {
      req.body = {
        spaceId: 'uuid-espaco-1',
        empresaId: 'uuid-empresa-1'
      };

      const mockEspaco = {
        id: 'uuid-espaco-1',
        status: 'DISPONIVEL',
        empresa_id: null,
        save: jest.fn().mockResolvedValue(true)
      };

      EspacoFisico.findByPk.mockResolvedValue(mockEspaco);
      Empresa.findByPk.mockResolvedValue({ id: 'uuid-empresa-1' });

      await allocate(req, res);

      expect(mockEspaco.empresa_id).toBe('uuid-empresa-1');
      expect(mockEspaco.status).toBe('OCUPADO');
      expect(mockEspaco.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve liberar espaço quando empresaId for nulo (200)', async () => {
      req.body = {
        spaceId: 'uuid-espaco-1',
        empresaId: null // desalocando
      };

      const mockEspaco = {
        id: 'uuid-espaco-1',
        status: 'OCUPADO',
        empresa_id: 'uuid-empresa-antiga',
        save: jest.fn().mockResolvedValue(true)
      };

      EspacoFisico.findByPk.mockResolvedValue(mockEspaco);

      await allocate(req, res);

      expect(mockEspaco.empresa_id).toBeNull();
      expect(mockEspaco.status).toBe('DISPONIVEL');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 404 se o espaço físico não for encontrado', async () => {
      req.body = { spaceId: 'uuid-inexistente' };
      EspacoFisico.findByPk.mockResolvedValue(null);

      await allocate(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

