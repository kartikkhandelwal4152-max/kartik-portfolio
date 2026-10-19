import PDFDocument from 'pdfkit';
import {Document,Packer,Paragraph,TextRun,HeadingLevel} from 'docx';
export const resume = {
 name:'Kartik Khandelwal',headline:'Computer Science Student | Web Development, AI & Cybersecurity',
 location:'Jaipur, India',
 sections:[
 ['Profile',['Computer Science student at JK Lakshmipat University, interested in building web applications and exploring AI and cybersecurity through practical projects.']],
 ['Education',['B.Tech in Computer Science & Engineering — JK Lakshmipat University, Jaipur','Currently studying. Education dates and contact details to be confirmed.']],
 ['Project experience',['Adaptive Physics AI Tutor — Exploring structured physics question datasets, LLM feedback and concept-focused practice. Technologies: Python, LLMs, RAG.','Sentinel Endpoint Monitoring — Academic prototype for telemetry collection, rule-based alerts and anomaly detection. Technologies: Python, Scikit-learn, SQLite.','Personal Portfolio — React frontend with Express routes for contact submissions and resume downloads; MongoDB storage through Mongoose.']],
 ['Skills',['JavaScript, React, HTML, CSS, Python; learning Node.js, Express, MongoDB, machine learning and cybersecurity.']],
 ['Activities',['Event coordination experience including food, accommodation, guest coordination and vendor communication.']],
 ['Review before sharing',['Starter resume: add your verified contact details, education dates, project URLs and certificates before submission.']]
 ]
};
export function pdfResume(){const doc=new PDFDocument({size:'A4',margin:48,info:{Title:'Kartik Khandelwal Resume',Author:'Kartik Khandelwal'}});doc.font('Helvetica-Bold').fontSize(23).fillColor('#161616').text(resume.name);doc.moveDown(.4).font('Helvetica').fontSize(10).text(resume.headline).text(resume.location);for(const [heading,lines] of resume.sections){doc.moveDown(1).font('Helvetica-Bold').fontSize(12).fillColor('#253e5b').text(heading);doc.moveDown(.35).font('Helvetica').fontSize(9.5).fillColor('#222222');for(const line of lines){doc.text(line,{lineGap:2});doc.moveDown(.45)}}return doc;}
export function wordResume(){const children=[new Paragraph({text:resume.name,heading:HeadingLevel.TITLE}),new Paragraph(resume.headline),new Paragraph(resume.location)];for(const[heading,lines]of resume.sections){children.push(new Paragraph({text:heading,heading:HeadingLevel.HEADING_2}));for(const line of lines)children.push(new Paragraph({children:[new TextRun({text:line,size:20})],spacing:{after:120}}))}return Packer.toBuffer(new Document({creator:'Kartik Khandelwal',title:'Kartik Khandelwal Resume',sections:[{children}]}));}
