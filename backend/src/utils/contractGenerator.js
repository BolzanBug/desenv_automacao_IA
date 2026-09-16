/**
 * Gerador de Minutas Contratuais Automatizadas — Pollen Parque
 * Substitui a antiga minuta padrão do Google Drive preenchida manualmente com 'X'
 */
export function generateContractTemplate(empresa, options = {}) {
  const anuidade = options.valor_anuidade || options.valorAnuidade || 3600.00;
  const termoNumero = `TERMO-POLLEN/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`;
  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const razaoSocial = (empresa.razaoSocial || empresa.razao_social || '').toUpperCase();
  const nomeFantasia = empresa.nomeFantasia || empresa.nome_fantasia;
  const cnpj = empresa.cnpj;
  const identificadorInternacional = empresa.identificadorInternacional || empresa.identificador_internacional;
  const tipo = empresa.tipo || 'STARTUP';
  const enderecoCompleto = empresa.enderecoCompleto || empresa.endereco_completo || 'Endereço Comercial Cadastrado';
  const cidade = empresa.cidade || 'Chapecó';
  const estado = empresa.estado || 'SC';
  const cep = empresa.cep || '89800-000';
  const pais = empresa.pais || 'Brasil';
  const representanteNome = empresa.representanteNome || empresa.representante_nome || '';
  const representanteCpf = empresa.representanteCpf || empresa.representante_cpf;
  const statusAlteracaoContratual = empresa.statusAlteracaoContratual ?? empresa.status_alteracao_contratual;

  const identificadorFiscal = cnpj 
    ? `inscrita no CNPJ sob o nº ${cnpj}`
    : `registrada internacionalmente sob o código de identificação fiscal nº ${identificadorInternacional || 'N/A'}`;

  const conteudo = `
# INSTRUMENTO PARTICULAR DE TERMO DE ADESÃO AO PROGRAMA DE EMPRESAS AFILIADAS DO POLLEN PARQUE CIENTÍFICO E TECNOLÓGICO
**${termoNumero}**

Pelo presente instrumento particular, de um lado:

**POLLEN PARQUE CIENTÍFICO E TECNOLÓGICO**, mantido pela Fundação Universitária de Desenvolvimento Científico e Tecnológico, pessoa jurídica de direito privado sem fins lucrativos, com sede na cidade de Chapecó, Estado de Santa Catarina, doravante denominado simplesmente **POLLEN PARQUE**, neste ato representado por sua Diretoria Executiva, Procuradoria Jurídica e Magnífico Reitor em exercício;

E, de outro lado:

**${razaoSocial}**${nomeFantasia ? ` (Nome Fantasia: ${nomeFantasia})` : ''}, pessoa jurídica classificada na categoria de **${tipo}**, ${identificadorFiscal}, com sede localizada em **${enderecoCompleto}**, ${cidade} - ${estado}, CEP: ${cep}, ${pais}, neste ato representada legalmente por **${representanteNome}**${representanteCpf ? `, portador do CPF nº ${representanteCpf}` : ''}, doravante denominada simplesmente **AFILIADA**;

Têm entre si, justo e acordado, o presente Termo de Adesão, mediante as seguintes cláusulas e condições:

---

### CLÁUSULA PRIMEIRA — DO OBJETO
1.1. O presente instrumento tem por objeto a formalização da adesão da AFILIADA ao ecossistema do POLLEN PARQUE, concedendo o direito de usufruir dos serviços de conexão, capacitações, networking, utilização de infraestrutura tecnológica e chancela institucional do Parque Científico e Tecnológico, de acordo com o regulamento do Edital Vigente.

### CLÁUSULA SEGUNDA — DAS CONDIÇÕES ESPECÍFICAS DA AFILIADA
2.1. A AFILIADA enquadra-se no perfil: **${tipo}**.
${statusAlteracaoContratual ? '2.2. A AFILIADA declara estar em processo formal de alteração estatutária/contratual, comprometendo-se a protocolar a via arquivada na Junta Comercial no prazo improrrogável de até 60 (sessenta) dias junto à administração do POLLEN PARQUE.\n' : ''}
${tipo === 'INTERNACIONAL' ? '2.3. Por se tratar de empresa com domicílio societário internacional, a AFILIADA compromete-se a manter procurador constituído no Brasil com poderes específicos para receber citações e notificações judiciais e extrajudiciais.\n' : ''}

### CLÁUSULA TERCEIRA — DOS RECURSOS FINANCEIROS E ANUIDADE
3.1. A AFILIADA pagará ao POLLEN PARQUE o valor total correspondente à anuidade de **R$ ${Number(anuidade).toFixed(2).replace('.', ',')}** (três mil e seiscentos reais), a ser liquidado através de Boleto Bancário ou chave PIX institucional informada no módulo financeiro, conforme condições pactuadas com a Contabilidade.

### CLÁUSULA QUARTA — DA VIGÊNCIA E RENOVAÇÃO
4.1. O presente convênio vigorará pelo prazo de 12 (doze) meses contados a partir da data de coleta da última assinatura dos representantes institucionais e do Reitor em exercício, sendo passível de renovação após prestação de contas anual e manifestação de interesse em até 30 (trinta) dias antes do término da vigência.

### CLÁUSULA QUINTA — DA CONFORMIDADE E ASSINATURAS
5.1. Este instrumento entra em eficácia plena mediante o cumprimento do protocolo oficial de 5 (cinco) signatários, compreendendo o Representante Legal da AFILIADA, os três representantes institucionais do POLLEN PARQUE e o Reitor em exercício, conforme registro no sistema informatizado de controle de convênios.

${options.clausulas_adicionais || options.clausulasAdicionais ? `\n### CLÁUSULA ESPECÍFICA ADICIONAL\n${options.clausulas_adicionais || options.clausulasAdicionais}\n` : ''}

Chapecó - SC, ${dataHoje}.

________________________________________________________
**${razaoSocial}**
Representante Legal: ${representanteNome}

________________________________________________________
**POLLEN PARQUE CIENTÍFICO E TECNOLÓGICO**
Diretoria Executiva / Coordenação Institucional 1

________________________________________________________
**POLLEN PARQUE CIENTÍFICO E TECNOLÓGICO**
Coordenação de Parcerias e Negócios / Institucional 2

________________________________________________________
**PROCURADORIA JURÍDICA**
Parecer de Conformidade Legal / Institucional 3

________________________________________________________
**REITORIA EM EXERCÍCIO**
Homologação Superior Institucional
`.trim();

  return {
    numero_termo: termoNumero,
    numeroTermo: termoNumero,
    titulo: `Termo de Adesão ao Programa de Afiliados — ${empresa.razaoSocial || empresa.razao_social}`,
    conteudo_gerado: conteudo,
    conteudoGerado: conteudo,
    valor_anuidade: anuidade,
    valorAnuidade: anuidade
  };
}
