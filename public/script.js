document.getElementById("pdfInput").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    const pageCountElement = document.getElementById("pageCount");
  
    if (!file) {
      pageCountElement.textContent = "";
      return;
    }
  
    if (file.type !== "application/pdf") {
      pageCountElement.textContent = "Por favor, selecione um arquivo PDF.";
      return;
    }
  
    try {
      const fileReader = new FileReader();
  
      fileReader.onload = async (e) => {
        const arrayBuffer = e.target.result;
  
        // Carrega o PDF e conta as páginas usando pdf-lib
        const { PDFDocument } = PDFLib;
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
  
        // Atualiza o texto na página
        pageCountElement.textContent = `O PDF possui ${pageCount} página(s).`;
      };
  
      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Erro ao processar o PDF:", error);
      pageCountElement.textContent = "Erro ao processar o PDF.";
    }
  });
  
  // Adiciona funcionalidade ao botão "Enviar PDF"
  document.getElementById("submitBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("pdfInput");
    const fileName = document.getElementById("fileName").value.trim();
    
    if (!fileInput.files.length) {
        alert("Por favor, selecione pelo menos um arquivo PDF.");
        return;
    }

    if (!fileName) {
        alert("Por favor, insira um nome para o arquivo final.");
        return;
    }

    const formData = new FormData();
    for (let file of fileInput.files) {
        formData.append("pdfs", file);
    }
    formData.append("fileName", fileName);

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${fileName}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            alert("Download concluído!");
        } else {
            alert("Erro ao processar os arquivos.");
        }
    } catch (error) {
        console.error("Erro ao enviar os PDFs:", error);
        alert("Erro ao enviar os arquivos.");
    }
});
