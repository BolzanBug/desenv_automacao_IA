import AssinaturaContrato from '../models/AssinaturaContratoModel.js';
import Empresa from '../models/EmpresaModel.js';
import AuditoriaLog from '../models/AuditoriaLogModel.js';

const getByEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const assinaturas = await AssinaturaContrato.findAll({
      where: { empresaId: id },
      order: [['createdAt', 'ASC']]
    });

    return res.status(200).send({
      message: 'Assinaturas consultadas com sucesso',
      data: assinaturas
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao consultar assinaturas', error: error.message });
  }
};

const updateSignatario = async (req, res) => {
  try {
    const { id, tipo } = req.params;
    const { assinado, nome, observacoes } = req.body;

    let assinatura = await AssinaturaContrato.findOne({
      where: {
        empresaId: id,
        signatarioTipo: tipo
      }
    });

    if (!assinatura) {
      // Caso não exista, inicializa
      assinatura = await AssinaturaContrato.create({
        empresaId: id,
        signatarioTipo: tipo,
        nome: nome || 'Signatário ' + tipo,
        assinado: false
      });
    }

    assinatura.assinado = assinado !== undefined ? Boolean(assinado) : true;
    if (nome) assinatura.nome = nome;
    if (observacoes !== undefined) assinatura.observacoes = observacoes;
    assinatura.dataAssinatura = assinatura.assinado ? new Date() : null;

    await assinatura.save();

    // Verifica se os 5 signatários assinaram
    const todasAssinaturas = await AssinaturaContrato.findAll({
      where: { empresaId: id }
    });

    const totalAssinados = todasAssinaturas.filter(a => a.assinado).length;
    const empresa = await Empresa.findByPk(id);

    if (empresa) {
      if (todasAssinaturas.length >= 5 && totalAssinados === todasAssinaturas.length) {
        empresa.status = 'AGUARDANDO_PAGAMENTO';
        await empresa.save();
      } else if (empresa.status === 'MINUTA_GERADA' && totalAssinados > 0) {
        empresa.status = 'EM_ASSINATURA';
        await empresa.save();
      }
    }

    await AuditoriaLog.create({
      empresaId: id,
      acao: 'ASSINATURA_ATUALIZADA',
      usuario: 'PROCURADORIA_OPERADOR',
      detalhes: JSON.stringify({ signatarioTipo: tipo, assinado: assinatura.assinado, nome: assinatura.nome })
    });

    return res.status(200).send({
      message: 'Status de assinatura atualizado com sucesso',
      data: {
        assinatura,
        todasAssinadas: totalAssinados === todasAssinaturas.length,
        totalAssinados,
        totalEsperado: todasAssinaturas.length
      }
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao atualizar assinatura', error: error.message });
  }
};

export default {
  getByEmpresa,
  updateSignatario
};
