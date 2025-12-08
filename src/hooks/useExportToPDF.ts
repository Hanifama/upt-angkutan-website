import { useRef, useCallback } from "react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";

export const useExportToPDF = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const exportToPDF = useCallback(async () => {
    if (!contentRef.current) return;

    try {
      // Show loading state
      const loadingElement = document.createElement("div");
      loadingElement.style.position = "fixed";
      loadingElement.style.top = "50%";
      loadingElement.style.left = "50%";
      loadingElement.style.transform = "translate(-50%, -50%)";
      loadingElement.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      loadingElement.style.color = "white";
      loadingElement.style.padding = "20px";
      loadingElement.style.borderRadius = "8px";
      loadingElement.style.zIndex = "9999";
      loadingElement.innerHTML = "Tunggu sebentar, sedang di proses...";
      document.body.appendChild(loadingElement);

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Hanya ambil card dengan data-export-card="main"
      const cards = contentRef.current.querySelectorAll(
        '[data-export-card="main"]'
      ) as NodeListOf<HTMLElement>;

      console.log("Card utama yang akan di-export:", cards.length);

      // Store original backgrounds
      const originalBackgrounds: string[] = [];
      cards.forEach((card) => {
        originalBackgrounds.push(card.style.background);
        card.style.background = "white";
      });

      // Process each card individually
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];

        // Add new page for each card (except first card)
        if (i > 0) {
          pdf.addPage();
        }

        console.log(
          `Processing card ${i + 1}:`,
          card.querySelector(".ant-card-head-title")?.textContent
        );

        // Convert card to image
        const canvas = await htmlToImage.toCanvas(card, {
          backgroundColor: "#ffffff",
          quality: 1,
          pixelRatio: 2,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
          },
        });

        // Calculate dimensions to fit page
        const imgWidth = pageWidth - 20; // Margin left & right
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Center the image on page if it's smaller than page height
        let yPosition = 10;
        if (imgHeight < pageHeight - 20) {
          yPosition = (pageHeight - imgHeight) / 2;
        }

        // Add card image to PDF
        pdf.addImage(
          canvas.toDataURL("image/jpeg", 1.0),
          "JPEG",
          10, // x position
          yPosition,
          imgWidth,
          imgHeight
        );

        // Add page number
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Halaman ${i + 1} dari ${cards.length}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      // Restore original backgrounds
      cards.forEach((card, index) => {
        card.style.background = originalBackgrounds[index];
      });

      // Remove loading element
      document.body.removeChild(loadingElement);

      // Save PDF
      pdf.save(
        `dashboard-kinerja-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Terjadi kesalahan saat membuat PDF");

      // Remove loading element on error
      const loadingElement = document.querySelector(
        'div[style*="position: fixed"]'
      );
      if (loadingElement) {
        document.body.removeChild(loadingElement);
      }
    }
  }, []);

  return { contentRef, exportToPDF };
};
