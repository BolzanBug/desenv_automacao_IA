import { jest } from '@jest/globals';
import {
  create,
  getAll,
  getById,
  update,
  remove,
  updateLegalStatus
} from '../backend/src/controllers/empresaController.js';
import { Empresa, ProcessoJuridico } from '../backend/src/models/index.js';

jest.mock('../backend/src/models/index.js', () => ({
  Empresa: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  ProcessoJuridico: {
    findOne: jest.fn(),
    create: jest.fn()
  },
  Documento: {},
  Cobranca: {},
  HistoricoEmail: {},
  EspacoFisico: {}
}));

describe('Empresa Controller - Testes Automatizados de Unidade e Integração', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('deve criar uma empresa com sucesso e inicializar o trâmite jurídico (201)', async () => {
      req.body = {
        razaoSocial: 'Inovação Tech LTDA',
        cnpj: '12.345.678/0001-90',
        nomeContato: 'João Silva',
        email: 'contato@inovacao.com',
        telefone: '49999998888',
        endereco: 'Rua da Inovação, 100 - Pollen Parque'
      };

      Empresa.findOne.mockResolvedValue(null);
      Empresa.create.mockResolvedValue({
        id: 'uuid-empresa-1',
        razao_social: req.body.razaoSocial,
        cnpj: req.body.cnpj,
        status_jornada: 'INSCRITA'
      });
      ProcessoJuridico.create.mockResolvedValue({ id: 'uuid-proc-1' });

      await create(req, res);

      expect(Empresa.findOne).toHaveBeenCalledWith({ where: { cnpj: req.body.cnpj } });
      expect(Empresa.create).toHaveBeenCalled();
      expect(ProcessoJuridico.create).toHaveBeenCalledWith(
        expect.objectContaining({ empresa_id: 'uuid-empresa-1', status_assinatura: 'AGUARDANDO_PROCURADORIA' })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('sucesso'),
          data: expect.objectContaining({ id: 'uuid-empresa-1' })
        })
      );
    });

    it('deve retornar 400 se campos obrigatórios estiverem faltando', async () => {
      req.body = { razaoSocial: 'Empresa Incompleta' }; // sem cnpj, email, etc.

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('obrigatórios ausentes') })
      );
    });

    it('deve retornar 409 se CNPJ já estiver cadastrado no sistema', async () => {
      req.body = {
        razaoSocial: 'Empresa Duplicada',
        cnpj: '12.345.678/0001-90',
        nomeContato: 'Carlos',
        email: 'carlos@empresa.com',
        telefone: '49988887777',
        endereco: 'Av Central'
      };

      Empresa.findOne.mockResolvedValue({ id: 'uuid-existente' });

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Já existe') })
      );
    });

    it('deve retornar 500 se ocorrer erro inesperado no banco de dados', async () => {
      req.body = {
        razaoSocial: 'Falha DB',
        cnpj: '00.000.000/0001-00',
        nomeContato: 'Teste',
        email: 'teste@db.com',
        telefone: '123',
        endereco: 'Rua X'
      };

      Empresa.findOne.mockRejectedValue(new Error('Falha de conexão com PostgreSQL'));

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Falha de conexão com PostgreSQL' })
      );
    });
  });

  describe('getAll()', () => {
    it('deve listar todas as empresas e calcular dias restantes de vigência (200)', async () => {
      const mockEmpresa = {
        get: jest.fn().mockReturnValue({
          id: 'uuid-1',
          razao_social: 'Tech Pollen',
          cnpj: '11.111.111/0001-11',
          data_fim_vigencia: '2027-12-31'
        })
      };

      Empresa.findAll.mockResolvedValue([mockEmpresa]);

      await getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          count: 1,
          data: expect.arrayContaining([
            expect.objectContaining({
              razao_social: 'Tech Pollen',
              diasRestantesVigencia: expect.any(Number)
            })
          ])
        })
      );
    });
  });

  describe('getById()', () => {
    it('deve retornar a ficha 360° da empresa com sucesso (200)', async () => {
      req.params.id = 'uuid-123';
      const mockFullEmpresa = {
        id: 'uuid-123',
        razao_social: 'Empresa Completa',
        documentos: [],
        cobrancas: [],
        processoJuridico: {}
      };

      Empresa.findByPk.mockResolvedValue(mockFullEmpresa);

      await getById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ data: mockFullEmpresa })
      );
    });

    it('deve retornar 404 se a empresa não for localizada', async () => {
      req.params.id = 'uuid-inexistente';
      Empresa.findByPk.mockResolvedValue(null);

      await getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateLegalStatus()', () => {
    it('deve concluir trâmite e ativar empresa quando todas as 5 assinaturas forem confirmadas', async () => {
      req.params.id = 'uuid-empresa';
      req.body = {
        numeroChamadoProcuradoria: 'PROC-2026/001',
        assinadoRepLegal: true,
        assinadoInst1: true,
        assinadoInst2: true,
        assinadoInst3: true,
        assinadoReitor: true
      };

      const mockProcesso = {
        assinado_rep_legal: false,
        assinado_inst_1: false,
        assinado_inst_2: false,
        assinado_inst_3: false,
        assinado_reitor: false,
        save: jest.fn().mockResolvedValue(true)
      };

      ProcessoJuridico.findOne.mockResolvedValue(mockProcesso);
      Empresa.update.mockResolvedValue([1]);

      await updateLegalStatus(req, res);

      expect(mockProcesso.status_assinatura).toBe('ASSINADO_CONCLUIDO');
      expect(Empresa.update).toHaveBeenCalledWith(
        { status_jornada: 'ATIVA' },
        { where: { id: 'uuid-empresa' } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
