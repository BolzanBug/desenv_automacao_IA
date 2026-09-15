import { jest } from '@jest/globals';
import { generate, upload, getByCompany } from '../backend/src/controllers/documentoController.js';
import { Empresa, Documento } from '../backend/src/models/index.js';
import * as contractUtils from '../backend/src/utils/contractGenerator.js';

jest.mock('../backend/src/models/index.js', () => ({
  Empresa: {
    findByPk: jest.fn()
  },
  Documento: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn()
  }
}));

jest.mock('../backend/src/utils/contractGenerator.js', () => ({
  saveContractDocument: jest.fn()
}));

describe('Documento Controller - Minuta Automática & Upload de Edital', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, file: null };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('generate()', () => {
    it('deve gerar automaticamente a minuta de contrato com variáveis preenchidas (201)', async () => {
      req.params.id = 'uuid-empresa-1';
      const mockEmpresa = {
        id: 'uuid-empresa-1',
        razao_social: 'Pollen BioTech',
        status_jornada: 'INSCRITA',
        save: jest.fn().mockResolvedValue(true)
      };

      Empresa.findByPk.mockResolvedValue(mockEmpresa);
      contractUtils.saveContractDocument.mockResolvedValue({
        fileName: 'Minuta_PollenBioTech.txt',
        filePath: '/uploads/Minuta_PollenBioTech.txt',
        fileSize: 1024,
        content: 'TERMO DE AFILIAÇÃO POLLEN PARQUE'
      });
      Documento.create.mockResolvedValue({ id: 'uuid-doc-1' });

      await generate(req, res);

      expect(Empresa.findByPk).toHaveBeenCalledWith('uuid-empresa-1');
      expect(contractUtils.saveContractDocument).toHaveBeenCalled();
      expect(Documento.create).toHaveBeenCalledWith(
        expect.objectContaining({ tipo_documento: 'MINUTA_CONTRATO' })
      );
      expect(mockEmpresa.status_jornada).toBe('EM_ANALISE');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('sucesso') })
      );
    });

    it('deve retornar 404 se a empresa para geração da minuta não for encontrada', async () => {
      req.params.id = 'uuid-inexistente';
      Empresa.findByPk.mockResolvedValue(null);

      await generate(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('upload()', () => {
    it('deve registrar o documento anexado do edital com sucesso (201)', async () => {
      req.params.id = 'uuid-empresa-1';
      req.file = {
        originalname: 'CND_Federal_2026.pdf',
        filename: '1234-CND_Federal_2026.pdf',
        size: 2048,
        mimetype: 'application/pdf'
      };
      req.body = { tipoDocumento: 'CND_FEDERAL' };

      Empresa.findByPk.mockResolvedValue({ id: 'uuid-empresa-1' });
      Documento.create.mockResolvedValue({ id: 'uuid-doc-cnd' });

      await upload(req, res);

      expect(Documento.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo_documento: 'CND_FEDERAL',
          nome_original: 'CND_Federal_2026.pdf'
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deve retornar 400 se nenhum arquivo for enviado no corpo multipart', async () => {
      req.params.id = 'uuid-empresa-1';
      req.file = null;

      Empresa.findByPk.mockResolvedValue({ id: 'uuid-empresa-1' });

      await upload(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

