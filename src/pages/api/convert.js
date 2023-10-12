// import Docxtemplater from "docxtemplater";
// import PizZip from "pizzip";
// import axios from "axios";
// import puppeteer from "puppeteer";
// import fs from 'fs'
// import path from "path";
// import {Readable} from 'stream';
// import mammoth from "mammoth";

// let PizZipUtils = null;

// if (typeof window !== "undefined") {
// import("pizzip/utils/index.js").then(function (r) {
//     PizZipUtils = r;
// });
// }

// function loadFile(url, callback) {
//     PizZipUtils.getBinaryContent(url, callback);
// }

// const tahunReverse = (string) => {
//     return string.split('/').reverse().join('/')
// }

// export default async (req, res) => {
//     if (req.method !== 'POST') {
//         return res.status(405).end()
//     }

//     const data = req.body

//     try {
            
//         let dataDitugaskan
//         let documentTemplate
    
//         dataDitugaskan = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/search?sptId=${data.id}&spt=true`, {withCredentials:true})
    
//         let ditugaskan
//         ditugaskan = dataDitugaskan.data
    
//         for (let i = 0; i < ditugaskan.length; i++) {
//             let test = i + 1
//             ditugaskan[i]["nomor"] = test
//         }
    
//         if (data.template === 'Kepala Badan') {
//             documentTemplate = 'spt-bappeda-kepalabadan-formatted'
//         } else if (data.template === 'Non Kepala Badan') {
//             documentTemplate = 'spt-bappeda-nonkepalabadan-formatted'
//         }

//         const filePath = path.join(process.cwd(), 'public', `/document/${documentTemplate}.docx`)
//         const content = fs.readFileSync(filePath, "binary")
//         var zip = new PizZip(content)
//         var doc = new Docxtemplater().loadZip(zip)

//         doc.render({
//             nomor_spt: data.nomor_spt,
//             ditugaskans: ditugaskan,
//             keperluan: data.keperluan,
//             lama_perjalanan: data.lama_perjalanan,
//             tanggal_berangkat: tahunReverse(data.tanggal_berangkat),
//             tanggal_kembali: tahunReverse(data.tanggal_kembali),
//             sub_kegiatan: data.subKegiatan.namaSubKegiatan,
//             kode_rekening: data.rekening.kodeRekening,
//             tanggal_spt: tahunReverse(data.tanggal_spt),
//             nama_kepala_bappeda: data.pejabat.nama,
//             pangkat_kepala_bappeda: data.pejabat.pangkat,
//             golongan_kepala_bappeda: data.pejabat.golongan,
//             nip_kepala_bappeda: data.pejabat.nip,
//         })

//         const generatedContent = doc.getZip().generate({type : 'nodebuffer'})

//         const outputPath = path.join(process.cwd(), 'public', `/temp/converted1.docx`)

//         fs.writeFileSync(outputPath, generatedContent)

//         const docxContent = fs.readFileSync(outputPath, 'binary')

//         const {value} = await mammoth.convertToHtml({buffer: docxContent})

//         const browser = await puppeteer.launch()
//         const page = await browser.newPage()

//         await page.setContent(value)      

//         const pdfBuffer = await page.pdf()

//         await browser.close()

//         const pdfFilePath = path.join(process.cwd(), 'public', `/temp/converted2.pdf`)

//         fs.writeFileSync(pdfFilePath, pdfBuffer)

//         const pdfBufferGo = fs.readFileSync(pdfFilePath)
        
//         res.setHeader('Content-Type','application/pdf')
//         res.setHeader('Content-Disposition', `inline; fileName=converted2.pdf`)
//         res.status(200).end(pdfBuffer)

//     } catch (error) {
//         console.error('Error: ', error)
//         res.status(500).json({error: 'Internal server error'})
//     }
// }

