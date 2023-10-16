import getConfig from 'next/config';
import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";

const Laporan = () => {
    const router = useRouter()
    const toast = useRef(null);

    const userDrop = [];
    const [dataUser, setDataUser] = useState(null)
    const [dataUserDrop, setDataUserDrop] = useState(null)    

    const [showDropdown, setShowDropdown] = useState(null)
    const [disabledTombolUbah, setDisabledTombolUbah] = useState(true)
    const [loading, setLoading] = useState(false)

    const [submitted, setSubmitted] = useState(false)
    const [session, setSession] = useState(null)

    const getSession = async () => {
        try {
            const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
            if (responseSession.data) {                    
                    getPegawai(responseSession.data.role, responseSession.data.id)
                    setSession(responseSession.data)
            } else {
                router.push("/")    
            }
        } catch (error) {
            router.push("/")
        }
    }

    const getPegawai = async (role, id) => {
        if (role === "admin") {
            const responsePegawai = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pegawai`, {withCredentials: true})
            if (responsePegawai.data) {
                responsePegawai.data?.map(d => (
                    userDrop.push({option: d.nama, value: d.id})
                ))
            }
            setDataUserDrop(userDrop)
            setShowDropdown(true)
        }  else {
            const responsePegawai = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pegawai/search?bidangId=${id}`, {withCredentials:true})
            if (responsePegawai.data) {
                responsePegawai.data?.map(d => (
                    userDrop.push({option: d.nama, value: d.id})
                ))
            }
            setDataUserDrop(userDrop)
            setShowDropdown(true)
        }
    }

    const testFunction = async (pegawaiId) => {
        setLoading(true)
        await generateDocument(pegawaiId)
        setLoading(false)
    }

    useEffect(() => {
        getSession()
    }, []);

    return (
        <div className="grid">
            <div className="col-12 md:col-6">
                <div className="card p-fluid">
                    <Toast ref={toast} />
                    <h3>Generate Laporan</h3>
                        {showDropdown && (
                            <div className="field">
                                <Dropdown value={dataUser} options={dataUserDrop} onChange={(e) => setDataUser(e.value)} optionLabel="option" optionValue="value" placeholder="Pilih pegawai" required filter filterBy='option' className={classNames({ 'p-invalid': submitted && !dataUser })} />
                                {submitted && !dataUser && <small className="p-invalid">Pegawai harus dipilih</small>}
                            </div>  
                        )}
                    <div className="field">
                        <Button label="Generate" disabled={dataUser ? false : true} onClick={() => testFunction(dataUser)} loading={loading} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Laporan;



// DOCUMENT TEMPLATING

let PizZipUtils = null;

if (typeof window !== "undefined") {
import("pizzip/utils/index.js").then(function (r) {
    PizZipUtils = r;
});
}

function loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
}

//TEMPLATING DOCUMENT
const generateDocument = async (pegawaiId) => {

    const tahunReverse = (string) => {
        return string.split('/').reverse().join('/')
    }

    let dataKwitansi
    let dataPejabat

    // let arrdDitugaskan = JSON.parse(rowData.ditugaskan)
    // let dataDitugaskanPromise = []
    // let dataFDitugaskan = []
    // let ditugaskan = []
    // let tanggal = tahunReverse(rowData.tanggal_spt)
    // let tahun = new Date().getFullYear()

    try {
        dataKwitansi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/kwitansi/laporan?pegawaiId=${pegawaiId}&spt=true`, {withCredentials:true})

        dataPejabat = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pejabat/search?jabatan=Kepala BAPPEDA`, {withCredentials:true})
    } catch (error) {
        console.error(error)
    }   

    let kwitansi
    kwitansi = dataKwitansi.data

    let pejabat
    pejabat = dataPejabat.data

    console.log(kwitansi)
    console.log(pejabat)
    console.log(pejabat.nama)
    console.log(pejabat.nip)

    const sumTotalBayar = kwitansi[0].sumTotalBayar
    const nip = kwitansi[0].nip
    const nama = kwitansi[0].namaPegawai


    loadFile(`/document/laporan-formatted.docx`, function (
      error,
      content
    ) {
      if (error) {
        throw error;
      }
      var zip = new PizZip(content);
      var doc = new Docxtemplater().loadZip(zip);
      doc.setData({
        dataLaporan: kwitansi,
        sumTotalBayar: sumTotalBayar,
        nip: nip,
        nama: nama,
        namaKepalaBappeda: pejabat[0].nama,
        nipKepalaBappeda: pejabat[0].nip
      });
      try {
        // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
        doc.render();
      } catch (error) {
        // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
        function replaceErrors(key, value) {
          if (value instanceof Error) {
            return Object.getOwnPropertyNames(value).reduce(function (
              error,
              key
            ) {
              error[key] = value[key];
              return error;
            },
            {});
          }
          return value;
        }
        console.log(JSON.stringify({ error: error }, replaceErrors));
  
        if (error.properties && error.properties.errors instanceof Array) {
          const errorMessages = error.properties.errors
            .map(function (error) {
              return error.properties.explanation;
            })
            .join("\n");
          console.log("errorMessages", errorMessages);
          // errorMessages is a humanly readable message looking like this :
          // 'The tag beginning with "foobar" is unopened'
        }
        throw error;
      }
      var out = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      }); 
      // Output the document using Data-URI
      saveAs(out, `laporan-perjadin-${nama}.docx`);
    });
  };