const fs = require('fs');
const unzipper = require('unzipper');

fs.createReadStream("erros-logica/Modelo minuta Programa de Afiliados (1).docx")
  .pipe(unzipper.Parse())
  .on('entry', function (entry) {
    if (entry.path === 'word/document.xml') {
      entry.buffer().then(buffer => {
        const xml = buffer.toString();
        const text = xml.replace(/<[^>]+>/g, '');
        console.log(text);
      });
    } else {
      entry.autodrain();
    }
  });
