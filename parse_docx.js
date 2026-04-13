const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");

try {
    const content = fs.readFileSync("Shan_latest_06_4.docx", "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });
    
    const text = doc.getFullText();
    
    // find potential placeholders like [text] or {text}
    const regex = /(\[.*?\]|\{.*?\})/g;
    const matches = text.match(regex);
    console.log("Found text fragments:");
    console.log(matches ? matches.slice(0, 50) : "None found.");
} catch (error) {
    console.error(error);
}
