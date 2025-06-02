import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

interface CertificateData {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issueDate: string;
  courseId: string | number;
  category?: string;
}

export const generateCertificatePDF = async (
  data: CertificateData
): Promise<Blob> => {
  // Add web fonts
  const fontLink = document.createElement("link");
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Great+Vibes&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap";
  fontLink.rel = "stylesheet";
  document.head.appendChild(fontLink);

  // Create a container element for the certificate
  const container = document.createElement("div");
  container.id = "certificate-to-pdf";
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "850px";
  container.style.height = "600px";
  container.style.padding = "0";
  container.style.margin = "0";

  // Set the certificate HTML content with dynamic data
  container.innerHTML = `
    <div style="
      width: 850px;
      height: 600px;
      position: relative;
      padding: 12px;
      background: linear-gradient(135deg, #e6ddc6 0%, #f9f6f0 50%, #e6ddc6 100%);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    ">
      <div style="
        width: 100%;
        height: 100%;
        position: relative;
        background-color: #ffffff;
        overflow: hidden;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.1) inset;
      ">
        <!-- Background pattern -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.02;
          background-image: 
              repeating-linear-gradient(45deg, #d4af37 0, #d4af37 1px, transparent 0, transparent 50%),
              repeating-linear-gradient(-45deg, #d4af37 0, #d4af37 1px, transparent 0, transparent 50%);
          background-size: 10px 10px;
        "></div>
        
        <!-- Luxury gold border -->
        <div style="
          position: absolute;
          top: 15px;
          left: 15px;
          right: 15px;
          bottom: 15px;
          border: 3px solid transparent;
          background: linear-gradient(90deg, #e5ca77, #d4af37, #f0e6aa, #d4af37, #e5ca77) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
        "></div>
        
        <div style="
          position: absolute;
          top: 25px;
          left: 25px;
          right: 25px;
          bottom: 25px;
          border: 1px solid rgba(212, 175, 55, 0.3);
        "></div>
        
        <!-- Corner decorations -->
        <div style="
          position: absolute;
          top: 15px;
          left: 15px;
          width: 35px;
          height: 35px;
          border-top: 6px solid #d4af37;
          border-left: 6px solid #d4af37;
          border-top-left-radius: 8px;
        "></div>
        
        <div style="
          position: absolute;
          top: 15px;
          right: 15px;
          width: 35px;
          height: 35px;
          border-top: 6px solid #d4af37;
          border-right: 6px solid #d4af37;
          border-top-right-radius: 8px;
        "></div>
        
        <div style="
          position: absolute;
          bottom: 15px;
          left: 15px;
          width: 35px;
          height: 35px;
          border-bottom: 6px solid #d4af37;
          border-left: 6px solid #d4af37;
          border-bottom-left-radius: 8px;
        "></div>
        
        <div style="
          position: absolute;
          bottom: 15px;
          right: 15px;
          width: 35px;
          height: 35px;
          border-bottom: 6px solid #d4af37;
          border-right: 6px solid #d4af37;
          border-bottom-right-radius: 8px;
        "></div>
        
        <!-- Decorative elements -->
        <div style="
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 2px;
          top: 70px;
          background: linear-gradient(90deg, 
              rgba(212,175,55,0) 0%, 
              rgba(212,175,55,0.5) 20%,
              rgba(212,175,55,1) 50%, 
              rgba(212,175,55,0.5) 80%,
              rgba(212,175,55,0) 100%);
        "></div>
        
        <div style="
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 2px;
          bottom: 95px;
          background: linear-gradient(90deg, 
              rgba(212,175,55,0) 0%, 
              rgba(212,175,55,0.5) 20%,
              rgba(212,175,55,1) 50%, 
              rgba(212,175,55,0.5) 80%,
              rgba(212,175,55,0) 100%);
        "></div>
        
        <!-- Elegant flourishes -->
        <div style="
          position: absolute;
          top: 110px;
          left: 60px;
          width: 100px;
          height: 40px;
          border-top: 1px solid #d4af37;
          border-left: 1px solid #d4af37;
          transform: rotate(-20deg);
          opacity: 0.4;
        "></div>
        
        <div style="
          position: absolute;
          bottom: 110px;
          right: 60px;
          width: 100px;
          height: 40px;
          border-bottom: 1px solid #d4af37;
          border-right: 1px solid #d4af37;
          transform: rotate(-20deg);
          opacity: 0.4;
        "></div>
        
        <!-- Certificate content -->
        <div style="
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 40px 60px;
          box-sizing: border-box;
          color: #333;
        ">
          <div style="
            margin-bottom: 15px;
            text-align: center;
            position: relative;
          ">
            <h1 style="
              font-family: 'Cinzel', serif;
              font-size: 50px;
              font-weight: 700;
              margin: 0;
              letter-spacing: 4px;
              color: #222;
              text-shadow: 0 1px 1px rgba(0,0,0,0.1);
            ">CERTIFICATE</h1>
            
            <h2 style="
              font-family: 'Lora', serif;
              font-size: 26px;
              font-style: italic;
              margin: 0;
              font-weight: 500;
              color: #666;
              letter-spacing: 2px;
            ">OF ACHIEVEMENT</h2>
          </div>
          
          <p style="
            font-family: 'Cormorant', serif;
            font-size: 20px;
            margin: 40px 0 10px;
            color: #555;
            font-weight: 500;
            letter-spacing: 0.5px;
          ">This is to certify that</p>
          
          <p style="
            font-family: 'Great Vibes', cursive;
            font-size: 56px;
            margin: 10px 0 40px;
            color: #111;
            text-align: center;
            position: relative;
            padding: 0 20px;
            text-shadow: 0 1px 1px rgba(0,0,0,0.05);
          ">${data.studentName}
            <span style="
              display: block;
              position: absolute;
              bottom: -10px;
              left: 50%;
              transform: translateX(-50%);
              width: 150px;
              height: 2px;
              background: linear-gradient(90deg, 
                  rgba(212,175,55,0) 0%, 
                  rgba(212,175,55,0.7) 30%,
                  rgba(212,175,55,0.7) 70%,
                  rgba(212,175,55,0) 100%);
            "></span>
          </p>
          
          <p style="
            font-family: 'Cormorant', serif;
            font-size: 22px;
            text-align: center;
            line-height: 1.6;
            margin: 0 0 35px;
            max-width: 600px;
            color: #444;
            font-weight: 500;
          ">
            has successfully completed the course <strong>${data.courseTitle}</strong> 
            with all requirements and assessments.
          </p>
          
          <div style="
            margin-top: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
          ">
            <div style="
              width: 200px;
              height: 1px;
              background: #d4af37;
              margin-bottom: 10px;
            "></div>
            <p style="
              font-family: 'Great Vibes', cursive;
              font-size: 38px;
              color: #333;
              margin: 5px 0;
            ">${data.instructorName}</p>
            
            <p style="
              font-family: 'Cormorant', serif;
              font-size: 18px;
              color: #666;
              letter-spacing: 1px;
              margin-top: 5px;
            ">Instructor</p>
          </div>
          
          <div style="
            position: absolute;
            bottom: 30px;
            left: 0;
            right: 0;
            text-align: center;
            font-family: 'Cormorant', serif;
            font-size: 14px;
            color: #666;
          ">
            Issued on: ${data.issueDate} • Certificate ID: ${data.courseId}
          </div>
        </div>
        
        <!-- Gold seal -->
        <div style="
          position: absolute;
          top: 60px;
          right: 60px;
          width: 130px;
          height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, 
                #fff6c2 0%, 
                #ffeb80 10%,
                #fcda5b 20%,
                #f8c935 40%,
                #e6bc2f 60%,
                #d4af37 80%, 
                #b38728 100%);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            position: relative;
          "></div>
          <div style="
            position: absolute;
            width: 85%;
            height: 85%;
            top: 7.5%;
            left: 7.5%;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, 
                #fff6c2 0%, 
                #ffeb80 5%,
                #fcda5b 15%,
                #f8c935 35%,
                #e6bc2f 65%,
                #d4af37 85%, 
                #b38728 100%);
            box-shadow: 
                0 0 15px rgba(255, 255, 255, 0.6) inset,
                0 0 15px rgba(0, 0, 0, 0.2);
          "></div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById("certificate-to-pdf");
        if (clonedElement) {
        }
      },
    });

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width / 2, canvas.height / 2],
    });

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      pdf.internal.pageSize.getWidth(),
      pdf.internal.pageSize.getHeight()
    );

    const blob = pdf.output("blob");
    return blob;
  } catch (error) {
    console.error("Certificate generation error:", error);
    throw error;
  } finally {
    // Clean up
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
};
