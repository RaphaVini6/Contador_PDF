const express = require("express");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

// Endpoint para upload e fusão dos PDFs
app.post("/upload", upload.array("pdfs", 10), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send("Nenhum arquivo foi enviado.");
    }

    const fileName = req.body.fileName ? req.body.fileName.replace(/\s+/g, "_") : "documento_fusionado";
    
    try {
        const mergedPdf = await PDFDocument.create();

        for (const file of req.files) {
            const pdfBytes = fs.readFileSync(file.path);
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const outputPath = path.join(__dirname, "uploads", `${fileName}.pdf`);
        fs.writeFileSync(outputPath, mergedPdfBytes);

        res.download(outputPath, `${fileName}.pdf`, () => {
            // Limpa os arquivos temporários
            req.files.forEach((file) => fs.unlinkSync(file.path));
            fs.unlinkSync(outputPath);
        });
    } catch (error) {
        console.error("Erro ao mesclar PDFs:", error);
        res.status(500).send("Erro ao processar os arquivos.");
    }
});

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
