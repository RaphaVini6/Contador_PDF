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
  document.getElementById("submitBtn").addEventListener("click", () => {
    const animation = document.getElementById("animation");
    const status = document.getElementById("status");
    const form = document.getElementById("uploadForm");
  
    // Esconde o formulário e mostra a animação
    form.classList.add("hidden");
    animation.classList.remove("hidden");
  
    // Simula o processo de envio e exibe a mensagem "Download concluído"
    setTimeout(() => {
      animation.classList.add("hidden");
      status.classList.remove("hidden");
    }, 3000); // Tempo de 3 segundos para a animação
  });
  