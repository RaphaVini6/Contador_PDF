document.getElementById("pdfInput").addEventListener("change", async (event) => {
  const files = event.target.files;
  const pageCountElement = document.getElementById("pageCount");

  if (!files.length) {
    pageCountElement.textContent = "";
    return;
  }

  pageCountElement.innerHTML = ""; // Limpa contagem anterior

  for (const file of files) {
    if (file.type !== "application/pdf") {
      pageCountElement.innerHTML += `<p style="color: red;">${file.name} não é um PDF.</p>`;
      continue;
    }

    try {
      const fileReader = new FileReader();

      fileReader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const { PDFDocument } = PDFLib;
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();

        // Exibe a contagem de páginas para cada arquivo
        pageCountElement.innerHTML += `<p>${file.name} tem ${pageCount} página(s).</p>`;
      };

      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Erro ao processar o PDF:", error);
      pageCountElement.innerHTML += `<p style="color: red;">Erro ao processar ${file.name}.</p>`;
    }
  }
});

// Função para exibir links de download após envio
document.getElementById("uploadForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const response = await fetch("/upload", { method: "POST", body: formData });

  if (!response.ok) {
    alert("Erro ao enviar PDFs.");
    return;
  }

  const data = await response.json();
  const downloadDiv = document.getElementById("downloadLinks");
  downloadDiv.innerHTML = "<h3>Downloads:</h3>";

  data.files.forEach(file => {
    const button = document.createElement("button");
    button.textContent = "Baixar PDF";
    
    button.onclick = () => {
      const fileName = prompt("Digite o nome do arquivo:", file.defaultName);
      if (fileName) {
        const link = document.createElement("a");
        link.href = file.url;  // Corrigido para garantir a URL correta
        link.download = `${fileName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    downloadDiv.appendChild(button);
  });
});
