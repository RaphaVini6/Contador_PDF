const express = require("express");
const multer = require("multer");
const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

// Rota para upload e processamento dos PDFs
app.post("/upload", upload.array("pdfs", 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("Nenhum arquivo enviado.");
  }

  const modifiedFiles = [];

  try {
    for (const file of req.files) {
      const filePath = file.path;
      const existingPdfBytes = fs.readFileSync(filePath);

      // Carrega o PDF
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();

      // Adiciona "SAPR X" em cada página
      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        page.drawText(`SAPR ${index + 1}`, {
          x: width - 80,
          y: 20,
          size: 14,
          color: rgb(0, 0, 0),
        });
      });

      const modifiedPdfBytes = await pdfDoc.save();
      const outputFileName = `Sapr-${file.filename}.pdf`;
      const outputPath = path.join(__dirname, "uploads", outputFileName);
      fs.writeFileSync(outputPath, modifiedPdfBytes);

      modifiedFiles.push({ filePath: outputPath, fileName: outputFileName });
    }

    res.json({
      files: modifiedFiles.map(file => ({
        url: `/download?file=${encodeURIComponent(file.fileName)}`,
        defaultName: "SAPR_Documento.pdf"
      }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao processar os PDFs.");
  }
});

// Rota para baixar arquivos processados
app.get("/download", (req, res) => {
  const fileName = req.query.file;
  const filePath = path.join(__dirname, "uploads", fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Arquivo não encontrado.");
  }

  res.download(filePath, fileName, () => {
    fs.unlinkSync(filePath); // Exclui o arquivo após o download
  });
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
