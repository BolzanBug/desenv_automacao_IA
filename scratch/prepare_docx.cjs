const fs = require('fs');
const unzipper = require('unzipper');
const archiver = require('archiver');
const path = require('path');

async function prepare() {
  const zip = fs.createReadStream("erros-logica/Modelo minuta Programa de Afiliados (1).docx").pipe(unzipper.Parse({forceStream: true}));
  const outStream = fs.createWriteStream("scratch/template.docx");
  const archive = archiver('zip');
  archive.pipe(outStream);
  
  for await (const entry of zip) {
    if (entry.path === 'word/document.xml') {
      const buffer = await entry.buffer();
      let xml = buffer.toString();
      
      // Replace known placeholders with docxtemplater tags
      xml = xml.replace(/XXXXXXXXXXXXXX/g, '{{razaoSocial}}');
      xml = xml.replace(/XXXXXXXXXXXXXXXXXXX/g, '{{emailContato}}');
      xml = xml.replace(/__ de ______________ de 2026/g, '{{dia}} de {{mes}} de {{ano}}');
      xml = xml.replace(/NomeCargoEmpresa/g, '{{representanteNome}} - {{representanteCargo}} - {{razaoSocial}}');
      
      archive.append(xml, { name: entry.path });
    } else {
      const buffer = await entry.buffer();
      archive.append(buffer, { name: entry.path });
    }
  }
  await archive.finalize();
  console.log("Template preparado!");
}
prepare().catch(console.error);
