import * as pdfjsLib from "pdfjs-dist"

if (typeof pdfjsLib !== "undefined" && pdfjsLib?.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@3.8.162/build/pdf.worker.min.js"
}

/**
 * Extracts PNR and CP codes from a PDF file
 * @param {ArrayBuffer} arrayBuffer - The PDF file as an ArrayBuffer
 * @returns {Promise<{cp: string|null, pnr: string|null}>} - The extracted CP and PNR codes
 */
export async function parsePNRFromPDF(arrayBuffer) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let pnr = null
    let cp = null

    // Search through each page until we find both PNR and CP
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const items = textContent.items.map((item) => item.str).join(" ")

      // Extract CP code if not already found
      if (!cp) {
        const matchCP = items.match(/Codice\s+CP[\s\S]*?(\d{6})/)
        if (matchCP) {
          cp = matchCP[1]
        }
      }

      // Extract PNR code if not already found
      if (!pnr) {
        const matchPNR = items.match(/PNR:\s*([A-Z0-9]{6})/)
        if (matchPNR) {
          pnr = matchPNR[1]
        }
      }

      // Break the loop if we found both codes
      if (cp && pnr) break
    }

    return { cp, pnr }
  } catch (error) {
    console.error("Error parsing PDF:", error)
    return { cp: null, pnr: null }
  }
}
