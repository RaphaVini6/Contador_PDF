const express = require("express");
const multer = require("multer");
const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

// Endpoint para upload do PDF e numeração de páginas
app.post("/upload", upload.single("pdf"), async (req, res) => {
  const filePath = req.file.path;
  try {
    const existingPdfBytes = fs.readFileSync(filePath);

    // Carrega o PDF existente
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();

    // Adiciona numeração no canto inferior direito
    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      page.drawText(`${index + 1}`, {
        x: width - 30,
        y: 20,
        size: 12,
        color: rgb(0, 0, 0),
      });
    });

    const modifiedPdfBytes = await pdfDoc.save();
    const outputPath = `uploads/modified-${req.file.filename}.pdf`;
    fs.writeFileSync(outputPath, modifiedPdfBytes);

    res.download(outputPath, "SAPR.pdf", () => {
      fs.unlinkSync(filePath); 
      fs.unlinkSync(outputPath); 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao processar o PDF.");
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
