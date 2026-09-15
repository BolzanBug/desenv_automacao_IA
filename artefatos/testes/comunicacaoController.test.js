import { jest } from '@jest/globals';
import { sendEmail, getHistory } from '../backend/src/controllers/comunicacaoController.js';
import { HistoricoEmail, Empresa } from '../backend/src/models/index.js';

jest.mock('../backend/src/models/index.js', () => ({
  HistoricoEmail: {
    bulkCreate: jest.fn(),
    findAll: jest.fn()
  },
  Empresa: {
    findAll: jest.fn()
  }
}));

describe('Comunicação Controller - Central de E-mails e Auditoria', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('sendEmail()', () => {
    it('deve disparar e-mails e salvar trilha de auditoria para as empresas selecionadas (200)', async () => {
      req.body = {
        companyIds: ['uuid-empresa-1', 'uuid-empresa-2'],
        assunto: 'Convocação para Assembleia de Inovação',
        conteudo: 'Convidamos para a reunião na sexta às 14h30.',
        tipoEnvio: 'MASSA'
      };

      Empresa.findAll.mockResolvedValue([
        { id: 'uuid-empresa-1', razao_social: 'Empresa Alpha', email: 'alpha@pollen.com' },
        { id: 'uuid-empresa-2', razao_social: 'Empresa Beta', email: 'beta@pollen.com' }
      ]);
      HistoricoEmail.bulkCreate.mockResolvedValue([]);

      await sendEmail(req, res);

      expect(Empresa.findAll).toHaveBeenCalled();
      expect(HistoricoEmail.bulkCreate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            empresa_id: 'uuid-empresa-1',
            assunto: 'Convocação para Assembleia de Inovação'
          })
        ])
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ totalEnviados: 2 })
      );
    });

    it('deve retornar 400 se a lista companyIds for vazia ou inválida', async () => {
      req.body = {
        companyIds: [],
        assunto: 'Teste',
        conteudo: 'Conteúdo'
      };

      await sendEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar 400 se assunto ou conteúdo faltarem', async () => {
      req.body = {
        companyIds: ['uuid-1'],
        assunto: '' // sem assunto
      };

      await sendEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

