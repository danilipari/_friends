if (typeof pdfjsLib !== "undefined" && pdfjsLib?.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@3.8.162/build/pdf.worker.min.js";
}

export async function parsePNRFromPDF(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let pnr = null;
  let cp = null;
  // let seat = null;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items.map((item) => item.str).join(" ");

    if (!cp) {
      const matchCP = items.match(/Codice\s+CP[\s\S]*?(\d{6})/);
      if (matchCP) {
        cp = matchCP[1];
      }
    }

    if (!pnr) {
      const matchPNR = items.match(/PNR:\s*([A-Z0-9]{6})/);
      if (matchPNR) {
        pnr = matchPNR[1];
      }
    }

    // if (!seat) {
    //   const matchPosition = items.match(/\b\d{1,2}[A-Z]\b/g);
    //   if (matchPosition) {
    //     seat = matchPosition[1];
    //   }
    // }

    if (cp && pnr) break;
  }

  return { cp, pnr };
}