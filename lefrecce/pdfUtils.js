export async function parsePNRFromPDF(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let pnr = null; // ZT9GQ5
  let cp = null; // 501901 || 493801

  console.log('pdf ->', pdf);
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    console.log('page ->', page);

    const textContent = await page.getTextContent();
    console.log('textContent ->', textContent);
    
    const items = textContent.items.map(item => item.str).join(' ');
    console.log('items ->', items);
    // console.log('items Mattia ->', textContent.items[35]);
    console.log('items Dani ->', textContent.items[116]);
    
    if (!pnr) {
      const matchPNR = items.match(/PNR:\s*([A-Z0-9]+)/);
      if (matchPNR) {
        pnr = matchPNR[1];
      }
    }
    
    if (!cp) {
      const matchCP = items.match(/Codice CP:\s*([A-Z0-9]+)/);
      if (matchCP) {
        cp = matchCP[1];
      }
    }
    
    if (pnr && cp) break;
  }
  
  return { pnr, cp };
}