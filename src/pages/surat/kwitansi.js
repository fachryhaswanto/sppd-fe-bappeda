import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { classNames } from 'primereact/utils';
import { FilterMatchMode } from 'primereact/api';
import { Divider } from 'primereact/divider';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";
import { InputTextarea } from 'primereact/inputtextarea';
import { useRouter } from 'next/router';
import { InputNumber } from 'primereact/inputnumber'

const Crud = () => {

    let emptyKwitansi = {
        id : '',
        sppdId : 0,
        pegawaiId: 0,
        nomorKwitansi : '',
        tanggalBayar : '',
        keperluan : '',
        totalBayar : 0,
        userId : ''
    }

    const router = useRouter()
    const [disabledTombol, setDisabledTombol] = useState(false)
    const [session, setSession] = useState(null)

    const [kwitansis, setKwitansis] = useState(null);
    const [kwitansiDialog, setKwitansiDialog] = useState(false);
    const [detailKwitansiDialog, setDetailKwitansiDialog] = useState(false);
    const [kwitansi, setKwitansi] = useState(emptyKwitansi);
    const [submitted, setSubmitted] = useState(false);
    const [deleteKwitansiDialog, setDeleteKwitansiDialog] = useState(false);

    const [editMode, setEditMode] = useState(false);
    const [nonGabunganMode, setNonGabunganMode] = useState(false);
    const [nomorSppd, setNomorSppd] = useState("");
    const [ditugaskan, setDitugaskan] = useState("");

    const [dataSppd, setDataSppd] = useState(null)
    const pegawaiDrop = []
    const [dataPegawai, setDataPegawai] = useState(null)
    const [namaPegawai, setNamaPegawai] = useState(null)

    const template = [
        {option:"Kepala Badan", value: "Kepala Badan"},
        {option:"Non Kepala Badan", value: "Non Kepala Badan"},
    ]

    const jenisPembayaran = [
        {option: "Uang Harian", value: "Uang Harian"},
        {option: "Uang Representatif", value: "Uang Representatif"},
        {option: "Biaya Hotel", value: "Biaya Hotel"},
        {option: "Biaya Tiket", value: "Biaya Tiket"},
        {option: "Transport Bandara", value: "Transport Bandara"},
    ]

    const sppdDrop = []
    const [dataSppdTest, setDataSppdTest] = useState(null)

    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const [simpanLoading, setSimpanLoading] = useState(false)
    const [uploadLoading, setUploadLoading] = useState(false)

    const [rincianDialog, setRincianDialog] = useState(false)
    const [rincianPenerbanganDialog, setRincianPenerbanganDialog] = useState(false)
    const [kwitansiId, setKwitansiId] = useState(false)
    const [kwitansiIdPenerbangan, setKwitansiIdPenerbangan] = useState(false)

    const [formElements, setFormElements] = useState([])
    const [formElementPenerbangan, setFormElementPenerbangan] = useState([])

    const [filter, setFilter] = useState(null)
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    
    const [tahun, setTahun] = useState(null);
    const tahuns = [
        {option: "2023", value: "2023"},
        {option: "2024", value: "2024"}
    ]

    const getSession = async () => {
        const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
        if (responseSession.data) {
            getKwitansi(responseSession.data.id)
            getSppd(responseSession.data.id)
            setSession(responseSession.data)
        } else {
            router.push("/")
        }
    }

    const getKwitansi = async (id) => {
        if (id === 8) {
            const responseKwitansi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/kwitansi`, {withCredentials: true})
            if (responseKwitansi.data) {
                setKwitansis(responseKwitansi.data)
            } else {
                setKwitansis(null)
            }
            setDisabledTombol(true)
            setLoading(false)
        } else {
            const responseKwitansi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/kwitansi/search?userId=${id}`, {withCredentials: true})
            if (responseKwitansi.data) {
                setKwitansis(responseKwitansi.data)
                setLoading(false)
            } else {
                setKwitansis(null)
                setLoading(false)
            }
        }
    }

    const getKwitansiByTahun = async (tahun) => {
        const id = session.id

        if (tahun) {
            if (id === 8) {
                const responseKwitansi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/kwitansi/search?tahun=${tahun}`, {withCredentials: true})
                if (responseKwitansi.data) {
                    setKwitansis(responseKwitansi.data)
                } else {
                    setKwitansis(null)
                }
                setDisabledTombol(true)
                setLoading(false)
            } else {
                const responseKwitansi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/kwitansi/search?userId=${id}&tahun=${tahun}`, {withCredentials: true})
                if (responseKwitansi.data) {
                    setKwitansis(responseKwitansi.data)
                    setLoading(false)
                } else {
                    setKwitansis(null)
                    setLoading(false)
                }
            }
        } else {
            getKwitansi(id)
        }
        setTahun(tahun)
    }

    const getSppd = async (id) => {
        if (id !== 8) {
            const responseSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/search?statusKwitansi=0&userId=${id}`, {withCredentials: true})
            if (responseSppd.data) {
                responseSppd.data?.map(d => (
                    sppdDrop.push({option:d.nomor_sppd, value:d.id})
                ))
            }
            setDataSppdTest(sppdDrop)
        }
    }

    useEffect(() => {
        getSession()
        initFilter();
    }, []);

    const openNew = () => {
        setKwitansi(emptyKwitansi);
        setSubmitted(false);
        setKwitansiDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setKwitansiDialog(false);
        setDetailKwitansiDialog(false);
        setDataSppd(null)
        setDataPegawai(null)

        setEditMode(false);
        setNonGabunganMode(false);
        setNomorSppd("")
        setDitugaskan("")
    };

    const hideRincianDialog = () => {
        setRincianDialog(false)
        setKwitansiId(null)
        setFormElements([])
    }

    const hideRincianPenerbanganDialog = () => {
        setRincianPenerbanganDialog(false)
        setKwitansiId(null)
        setFormElementPenerbangan([])
    }

    const saveKwitansi = async () => {
        setSubmitted(true);

        kwitansi.userId = session.id

        if (kwitansi.nomorKwitansi && kwitansi.sppdId && kwitansi.tanggalBayar && kwitansi.keperluan && kwitansi.pegawaiId) {

            setSimpanLoading(true)

            if (kwitansi.id) {
                const id = kwitansi.id;

                try {
                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/kwitansi/${id}`, kwitansi, {withCredentials:true})
                    if (response.status === 200){
                        getKwitansi(session.id)
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Kwitansi Berhasil Diperbarui', life: 3000 });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Kwitansi Gagal Diperbarui', life: 3000 });
                }
            } else {
                try {
                    const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + `/kwitansi`, kwitansi, {withCredentials:true})
                    if (response.status === 201) {
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Kwitansi Berhasil Disimpan', life: 3000 });

                        const response1 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/updatestatuskwitansi/${dataSppd.sptId}/${1}?pegawaiId=${kwitansi.pegawaiId}`, {}, {withCredentials:true})
                        if (response1.status === 200) {
                            toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Ditugaskan Berhasil Diperbarui', life: 3000 });
                        }
                        
                        if (nonGabunganMode) {
                            const response2 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/updatestatuskwitansi/${kwitansi.sppdId}/${1}`, {}, {withCredentials:true})
                            if (response2.status === 200) {
                                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPPD Berhasil Diperbarui', life: 3000 });
                            }
                        } else {
                            const responseJumlahPegawai = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/count/search?sptId=${dataSppd.sptId}`, {withCredentials:true})    

                            const responseJumlahYangPunyaKwitansi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/count/search?sptId=${dataSppd.sptId}&statusKwitansi=1`, {withCredentials:true})

                            const jumlahPegawai = responseJumlahPegawai.data
                            const jumlahYangPunyaKwitansi = responseJumlahYangPunyaKwitansi.data

                            if (jumlahPegawai === jumlahYangPunyaKwitansi) {
                                const response2 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/updatestatuskwitansi/${kwitansi.sppdId}/${1}`, {}, {withCredentials:true})
                                if (response2.status === 200) {
                                    toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPPD Berhasil Diperbarui', life: 3000 });
                                }
                            }    
                        }

                                            
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Kwitansi Gagal Disimpan', life: 3000 });
                }
            }

            getKwitansi(session.id)
            getSppd(session.id)

            setSimpanLoading(false)
            hideDialog();
            setKwitansiDialog(false);
            setKwitansi(emptyKwitansi);
        }
    };

    const saveRincianKwitansi = async () => {
        setConfirmLoading(true)
        setSubmitted(true)

        let isValid = false

        for (let i = 0; i < formElements.length; i++) {
            if (formElements[i].jenis === "" || formElements[i].namaRincian === "" || formElements[i].jumlahBayar === "" || formElements[i].jumlahBayar === 0 || formElements[i].banyaknya === "" || formElements[i].banyaknya === 0) {
                isValid = true
            }
        }

        if (isValid) {

            toast.current.show({ severity: 'error', summary: 'Kesalahan Penginputan', detail: 'Data Rincian Kwitansi Gagal Disimpan, Mohon Untuk Memperbaiki Inputan', life: 3000 });

        } else {

            let dataRincian = formElements.map(element => ({...element, kwitansiId:kwitansiId}))
            
            try {   
                const response = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/rinciankwitansi/${kwitansiId}`, {withCredentials:true})
                if (response.status === 200 && dataRincian.length !== 0) {
                    const response1 = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + `/rinciankwitansi`, dataRincian, {withCredentials:true})

                    if (response1.status === 201) {
                        let total = 0

                        for (let i = 0; i < formElements.length; i++) {
                            total += formElements[i].hasilBayar                        
                        }
                        
                        const response2 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/kwitansi/totalbayar/${kwitansiId}`, {totalBayar : total}, {withCredentials:true})  
                        if (response2.status === 200) {
                            toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Rincian Kwitansi Berhasil Disimpan', life: 3000 });
                            toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Total Bayar Kwitansi Berhasil Diperbarui', life: 3000 });                            
                        }
                    }
                } else {
                    const response2 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/kwitansi/${kwitansiId}`, {totalBayar : 0}, {withCredentials:true})
                    if (response2.status === 200) {
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Rincian Kwitansi Berhasil Disimpan', life: 3000 });
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Total Bayar Kwitansi Berhasil Diperbarui', life: 3000 });                            
                    }  
                }

            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Rincian Kwitansi Gagal Disimpan', life: 3000 });
            }
        }
        

        setSubmitted(false)
        hideRincianDialog()
        setConfirmLoading(false)
        getKwitansi(session.id)
    }

    const saveRincianKwitansiPenerbangan = async () => {
        setConfirmLoading(true)
        setSubmitted(true)

        let isValid = false

        for (let i = 0; i < formElementPenerbangan.length; i++) {
            if (formElementPenerbangan[i].namaMaskapai === "" || formElementPenerbangan[i].nomorTiket === "" || formElementPenerbangan[i].kodeBooking === "") {
                isValid = true
            }
        }

        if (isValid) {

            toast.current.show({ severity: 'error', summary: 'Kesalahan Penginputan', detail: 'Data Rincian Kwitansi Penerbangan Gagal Disimpan, Mohon Untuk Memperbaiki Inputan', life: 3000 });

        } else {

            let dataRincianPenerbangan = formElementPenerbangan.map(element => ({...element, kwitansiId:kwitansiIdPenerbangan}))
            
            try {  
                const response = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/rinciankwitansipenerbangan/${kwitansiIdPenerbangan}`, {withCredentials:true})
                if (response.status === 200 && dataRincianPenerbangan.length !== 0) {
                    const response1 = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + `/rinciankwitansipenerbangan`, dataRincianPenerbangan, {withCredentials:true})

                    if (response1.status === 201) {
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Rincian Kwitansi Penerbangan Berhasil Disimpan', life: 3000 });             
                    }
                } 
                // else {
                //     const response2 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/kwitansi/${kwitansiId}`, {totalBayar : 0}, {withCredentials:true})
                //     if (response2.status === 200) {
                //         toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Rincian Kwitansi Penerbangan Berhasil Disimpan', life: 3000 });
                //     }  
                // }

            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data Rincian Kwitansi Gagal Disimpan', life: 3000 });
            }
        }
        

        setSubmitted(false)
        hideRincianPenerbanganDialog()
        setConfirmLoading(false)
        getKwitansi(session.id)
    }

    const editKwitansi = (dataKwitansi) => {
        setKwitansi({ ...dataKwitansi });
        setKwitansiDialog(true);
        setNomorSppd(dataKwitansi.sppd.nomor_sppd)
        setNamaPegawai(dataKwitansi.pegawai.nama)
        setEditMode(true)
    };

    const openRincianDialog = async (id) => {
        setRincianDialog(true)
        setKwitansiId(id)

        try {
            const responseRincianKwitansi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/rinciankwitansi?kwitansiId=${id}`, {withCredentials:true})
            if (responseRincianKwitansi.status === 200) {
                if (responseRincianKwitansi.data === null) {
                    handleAddFormElement()
                } else {
                    setFormElements(responseRincianKwitansi.data)
                }
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const openRincianPenerbanganDialog = async (id) => {
        setRincianPenerbanganDialog(true)
        setKwitansiIdPenerbangan(id)

        try {
            const responseRincianPenerbangan = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/rinciankwitansipenerbangan?kwitansiId=${id}`, {withCredentials:true})
            if (responseRincianPenerbangan.status === 200) {
                if (responseRincianPenerbangan.data === null) {
                    handleAddFormElementPenerbangan()
                } else {
                    setFormElementPenerbangan(responseRincianPenerbangan.data)
                }
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    const deleteKwitansi = async () => {
        setConfirmLoading(true)

        try {
            const response1 = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/kwitansi/${kwitansi.id}`, {withCredentials:true})
            if (response1.status === 200) {
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Kwitansi  Berhasil Dihapus', life: 3000 });
                
                const response2 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/updatestatuskwitansi/${kwitansi.sppdId}/${0}`, {}, {withCredentials:true})
                if (response2.status === 200) {
                    toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPPD Berhasil Diperbarui', life: 3000 });
                }

                const response3 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/updatestatuskwitansi/${kwitansi.sppd.sptId}/${0}?pegawaiId=${kwitansi.pegawaiId}`, {}, {withCredentials:true})
                if (response3.status === 200) {
                    toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Ditugaskan Berhasil Diperbarui', life: 3000 });
                }
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi Kesalahan Data Gagal Dihapus', life: 3000 });
        }

        getKwitansi(session.id)
        getSppd(session.id)

        setDeleteKwitansiDialog(false);
        setKwitansi(emptyKwitansi);
        setConfirmLoading(false)
    }

    const handleIdFormElement = (someInt) => {
        let test = someInt

        return test.toString()
    }

    const handleAddFormElement = () => {
        const newElement = {id : handleIdFormElement(Date.now()), jenis : '', namaRincian : '', jumlahBayar : '', banyaknya : '', hasilBayar : ''}

        setFormElements([...formElements, newElement])
    }

    const handleAddFormElementPenerbangan = () => {
        const newElement = {id : handleIdFormElement(Date.now()), namaMaskapai : '', nomorTiket : '', kodeBooking : ''}

        setFormElementPenerbangan([...formElementPenerbangan, newElement])
    }

    const handleRemoveFormElement = (id) => {    
        if (formElements.length !== 1)  {
            const updatedElements = formElements.filter((element) => element.id !== id)
            setFormElements(updatedElements)
        }
    }

    const handleRemoveFormElementPenerbangan = (id) => {    
        if (formElementPenerbangan.length !== 1)  {
            const updatedElements = formElementPenerbangan.filter((element) => element.id !== id)
            setFormElementPenerbangan(updatedElements)
        }
    }

    const handleInputChange = (id, field, value) => {
        const updatedElements = formElements.map((element) => element.id === id ? {...element, [field]: value} : element)

        const elementRightNow = updatedElements.filter((element) => element.id === id)

        if (field === "jumlahBayar" || field === "banyaknya") {
            const jumlahBayarVal = elementRightNow[0].jumlahBayar
            const banyaknyaVal = elementRightNow[0].banyaknya
            const hasilBayarVal = 0
            if (jumlahBayarVal === null || banyaknyaVal === null) {
                elementRightNow[0].hasilBayar = hasilBayarVal
            } else {
                hasilBayarVal = jumlahBayarVal * banyaknyaVal
                elementRightNow[0].hasilBayar = hasilBayarVal
            }
        }

        setFormElements(updatedElements)
    }

    const handleInputChangePenerbangan = (id, field, value) => {
        const updatedElements = formElementPenerbangan.map((element) => element.id === id ? {...element, [field]: value} : element)

        const elementRightNow = updatedElements.filter((element) => element.id === id)

        setFormElementPenerbangan(updatedElements)
    }

    const confirmDeleteKwitansi = (kwitansi) => {
        setKwitansi(kwitansi)
        setDeleteKwitansiDialog(true)
    }
    
    const hideDeleteKwitansiDialog = () => {
        setDeleteKwitansiDialog(false)
    }

    const seeDetailKwitansiDialog = (kwitansi) => {    
        setKwitansi({ ...kwitansi });
        setDetailKwitansiDialog(true);
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const showRincianKwitansiDialog = () => {
        setRincianDialog(true)
    }

    const onInputChange = async (e, name) => {

        if (name === "sppdId") {
            const val = (e.target && e.target.value) || '';
            let _kwitansi = { ...kwitansi };
            
            const responseSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/${val}`, {withCredentials: true})
            if (responseSppd.data) {
                setDataSppd(responseSppd.data)

                let dataResponse = responseSppd.data

                if (dataResponse.jenis === "Gabungan") {
                    const responsePegawai = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/search?sptId=${dataResponse.sptId}&statusSppd=1&statusKwitansi=0`, {withCredentials:true})
                    if (responsePegawai.data) {
                        responsePegawai.data?.map(d => (
                            pegawaiDrop.push({option:d.namaPegawai, value:d.pegawaiId})
                        ))
                        setDataPegawai(pegawaiDrop)
                    } else {
                        toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi Kesalahan', life: 3000 });
                    }
                } else {
                    pegawaiDrop.push({option: dataResponse.pegawai.nama, value: dataResponse.pegawai.id})
                    setDataPegawai(pegawaiDrop)
                    setNonGabunganMode(true)
                }

            _kwitansi[`${name}`] = val;
    
            setKwitansi(_kwitansi);
            }
        } else if (name === "pegawaiId") {
            const val = (e.target && e.target.value) || '';
            let _kwitansi = { ...kwitansi };

            const responsePegawai = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pegawai/${val}`, {withCredentials:true})

            if (responsePegawai.data) {

                let dataPegawai = responsePegawai.data

                let stringVal = `Biaya Perjalanan Dinas ${dataSppd.tempat_berangkat} - ${dataSppd.tempat_tujuan} PP An. ${dataPegawai.nama} untuk program ${dataSppd.spt.subKegiatan.kegiatan.program.program} pada kegiatan ${dataSppd.spt.subKegiatan.kegiatan.namaKegiatan}`
    
               _kwitansi[`keperluan`] = stringVal
               _kwitansi[`${name}`] = val;
    
               setKwitansi(_kwitansi);
            }
        } else {
            const val = (e.target && e.target.value) || '';
            let _kwitansi = { ...kwitansi };
            _kwitansi[`${name}`] = val;
    
            setKwitansi(_kwitansi);
        }
    };

    const ambilTanggal = (tanggal) => {
        const date = new Date(tanggal)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = String(date.getDate()).padStart(2, '0')
        const withSlashes = [year,month,day].join("/")
        
        return withSlashes
    }

    const tanggalChange = (tanggal, name) => {

        let _kwitansi = { ...kwitansi };
        _kwitansi[`${name}`] = ambilTanggal(tanggal);
        
        // if(name === 'tanggal_spt'){
        //     let date = new Date(new Date(tanggal).setDate(new Date(tanggal).getDate() + 1))
        //     setMinDateBerangkat(date)
        // } else if (name === 'tanggal_berangkat') {
        //     let date = new Date(new Date(tanggal).setDate(new Date(tanggal).getDate() + 1))
        //     setMinDateKembali(date)
        // }

        setKwitansi(_kwitansi);
    }

    const tahunReverse = (string) => {
        return string?.split('/').reverse().join('/')
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Tambah Data Kwitansi" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} disabled={disabledTombol} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="card">
                    <h6>Tahun</h6>
                    <Dropdown value={tahun} options={tahuns} onChange={(e) => getKwitansiByTahun(e.value)} optionLabel="option" optionValue="value" showClear placeholder="Pilih tahun" />
                </div>
            </React.Fragment>
        );
    };

    const nomorSppdBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nomor SPPD</span>
                {rowData.sppd.nomor_sppd}
            </>
        );
    };

    const rincianBiayaBodyTemplate = (rowData) => {
        if (rowData.sppd.alat_angkutan === "Pesawat") {
            return (
                <>
                   <Button icon="pi pi-dollar" className="p-button-rounded p-button-info mr-2 mb-2" onClick={() => openRincianDialog(rowData.id)} tooltip="Rincian Biaya" tooltipOptions={{position:'top'}} disabled={disabledTombol} />
                   <Button icon="pi pi-send" className="p-button-rounded p-button-info mr-2" onClick={() => openRincianPenerbanganDialog(rowData.id)} tooltip="Rincian Biaya Penerbangan" tooltipOptions={{position:'top'}} disabled={disabledTombol} />
                </>
            );    
        } else {
            <Button icon="pi pi-dollar" className="p-button-rounded p-button-info mr-2" onClick={() => openRincianDialog(rowData.id)} tooltip="Rincian Biaya" tooltipOptions={{position:'top'}} disabled={disabledTombol} />
        }

        return (
            <>
               <Button icon="pi pi-dollar" className="p-button-rounded p-button-info mr-2" onClick={() => openRincianDialog(rowData.id)} tooltip="Rincian Biaya" tooltipOptions={{position:'top'}} disabled={disabledTombol} />
            </>
        );
    };

    const tempatBerangkatBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Tempat Berangkat</span>
                {rowData.tempat_berangkat}
            </>
        );
    };

    const tempatTujuanBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Tempat Tujuan</span>
                {rowData.tempat_tujuan}
            </>
        );
    };

    const alatAngkutanBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Alat Angkutan</span>
                {rowData.alat_angkutan}
            </>
        );
    };

    const instansiBodyTemplate = (rowData) => {

        return (
            <>
               {rowData.instansi}
            </>
        );
    };


    // const tempatBerangkatBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Tempat Berangkat</span>
    //             {rowData.tempat_berangkat}
    //         </>
    //     );
    // };

    // const tempatTujuanBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Tempat Tujuan</span>
    //             {rowData.tempat_tujuan}
    //         </>
    //     );
    // };

    const nomowKwitansiBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nomor Kwitansi</span>
                {rowData.nomorKwitansi}
            </>
        );
    };

    const tanggalBayarBodyTemplate = (rowData) => {
        const tanggalBayar = tahunReverse(rowData.tanggalBayar)
        return (
            <>
                <span className="p-column-title">Tanggal Bayar</span>
                {tanggalBayar}
            </>
        );
    };

    const convertToRupiah = (angka) => {
        let rupiah = ''
        const angkaRev = angka.toString().split('').reverse().join('')

        for (let i = 0; i < angkaRev.length; i++) {
            if (i % 3 === 0) {
                rupiah += angkaRev.substr(i, 3) + '.'
            }
        }

        return ('Rp. ' + rupiah.split('', rupiah.length - 1).reverse().join(''))
    }

    const totalBayarBodyTemplate = (rowData) => {
        const totalBayar = convertToRupiah(rowData.totalBayar)

        return (
            <>
                <span className="p-column-title">Sub Kegiatan</span>
                {totalBayar}
            </>
        );
    };

    // const jenisPerjalananBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Jenis Perjalanan</span>
    //             {rowData.jenis_perjalanan}
    //         </>
    //     );
    // };

    // const keperluanBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Keperluan</span>
    //             {rowData.keperluan}
    //         </>
    //     );
    // };

    // const tanggalBodyTemplate = (rowData) => {

    //     const tanggal_berangkat = tahunReverse(rowData.tanggal_berangkat)
    //     const tanggal_kembali = tahunReverse(rowData.tanggal_kembali)

    //     return (
    //         <>
    //             <span className="p-column-title">Tanggal</span>
    //             Berangkat: <b>{tanggal_berangkat}</b>
    //             <br></br><br></br>
    //             Kembali: <b>{tanggal_kembali}</b>
    //             <br></br><br></br>
    //             Lama Perjalanan: <Tag value={`${rowData.lama_perjalanan} hari`} ></Tag> 
    //         </>
    //     );
    // };

    // const instansiBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Tanggal</span>
    //             {rowData.instansi}
    //         </>
    //     );
    // };

    // const pejabatBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Pejabat Pemberi Tugas</span>
    //             {rowData.pejabat_pemberi}
    //         </>
    //     );
    // };

    const untukPembayaranBodyTemplate = (rowData) => {

        return (
            <>
                <span className="p-column-title">Untuk Pembayaran</span>
                {rowData.keperluan}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info mb-2" onClick={() => editKwitansi(rowData)} tooltip="Edit Kwitansi" tooltipOptions={{position:'top'}} disabled={disabledTombol} />
                {/* <Button icon="pi pi-send" className="p-button-rounded p-button-success mr-2" onClick={() => seeDetailKwitansiDialog(rowData)} tooltip="Detail SPPD" tooltipOptions={{position:'top'}} /> */}
                <Button icon="pi pi-file-word" className="p-button-rounded p-button-warning mr-2" onClick={() => checkingDocumentData(rowData)} tooltip="Download Kwitansi" tooltipOptions={{position:"top"}} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger mr-2 mt-2" onClick={() => confirmDeleteKwitansi(rowData)} tooltip="Hapus Kwitansi" tooltipOptions={{position: 'top'}} disabled={disabledTombol} />
            </>
        );
    };

    const checkingDocumentData = async (rowData) => {
        try {
            const responseRincianKwitansi = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/rinciankwitansi/search?kwitansiId=${rowData.id}`, {withCredentials:true})
            if (responseRincianKwitansi.data === null) {
                toast.current.show({ severity: 'warn', summary: 'Peringatan', detail: `Mohon untuk melengkapi data Rincian Biaya pada Kwitansi ${rowData.nomorKwitansi}`, life: 3000 });
            } else {
                generateDocument(rowData)
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: `Terjadi kesalahan`, life: 3000 });
        }
    }

    const initFilter = () => {
        setFilter({
            'global' : {value : null, matchMode : FilterMatchMode.CONTAINS}
        })
    }

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filter = { ...filter };
        _filter['global'].value = value;

        setFilter(_filter);
        setGlobalFilter(value);
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Data Kwitansi</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={onGlobalFilterChange} placeholder="Cari..." />
            </span>
        </div>
    );

    const kwitansiDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={simpanLoading} className="p-button-text p-button-raised" onClick={hideDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={simpanLoading} className="p-button-text p-button-raised" onClick={saveKwitansi} />
        </>
    );

    const deleteKwitansiDialogFooter = (
        <>
            <Button label="Tidak" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideDeleteKwitansiDialog} />
            <Button label="Ya" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={deleteKwitansi} />
        </>
    );

    const rincianKwitansiDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text p-button-primary" onClick={hideRincianDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={saveRincianKwitansi} />
        </>
    );

    const rincianKwitansiPenerbanganDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text p-button-primary" onClick={hideRincianPenerbanganDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={saveRincianKwitansiPenerbangan} />
        </>
    );

    const uploadSuratTugas = (kwitansi) => {
        setKwitansi(kwitansi);
        setUploadFileDialog(true);
    };
    const hideUploadDialog = () => {
        setUploadFileDialog(false)
    }

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={kwitansis}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                        filters={filter}
                        emptyMessage="Tidak ada data"
                        header={header}
                        responsiveLayout="scroll"
                        removableSort
                        showGridlines
                        loading={loading}
                    >
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="rincian_biaya" header="Rincian Biaya" sortable body={rincianBiayaBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="nomor_sppd" header="Nomor Sppd" sortable body={nomorSppdBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="nomor_kwitansi" header="Nomor Kwitansi" sortable body={nomowKwitansiBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="untuk_pembayaran" header="Untuk Pembayaran" sortable body={untukPembayaranBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="tanggalBayar" header="Tanggal Bayar" sortable body={tanggalBayarBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="totalBayar" header="Total Bayar" sortable body={totalBayarBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                    </DataTable>

                    {/* DIALOG TAMBAH DAN EDIT DATA */}
                    <Dialog visible={kwitansiDialog} blockScroll={true} closable={!simpanLoading} style={{ width: '600px' }} header="Data Kwitansi" modal className="p-fluid" footer={kwitansiDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="spt">Nomor SPPD</label>
                            {editMode ? (
                                <InputText value={nomorSppd} disabled={true} />
                            ) : (
                                <Dropdown value={kwitansi.sppdId} options={dataSppdTest} onChange={(e) => onInputChange(e, 'sppdId')} filter autoFocus optionLabel="option" optionValue="value" placeholder="Pilih nomor SPPD" required className={classNames({ 'p-invalid': submitted && !kwitansi.sppdId })} />
                            )}
                            
                            {submitted && !kwitansi.sppdId && <small className="p-invalid">Nomor SPPD harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="pegawai">Nama Pegawai</label>
                            {editMode ? (
                                <InputText value={namaPegawai} disabled={true} />
                            ) : (
                                <Dropdown value={kwitansi.pegawaiId} options={dataPegawai} onChange={(e) => onInputChange(e, 'pegawaiId')} optionLabel="option" optionValue="value" placeholder="Pilih pegawai" required className={classNames({ 'p-invalid': submitted && !kwitansi.pegawaiId })} />
                            )}

                            {submitted && !kwitansi.pegawaiId && <small className="p-invalid">Pegawai harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="nomor_kwitansi">Nomor Kwitansi</label>
                            <InputText value={kwitansi.nomorKwitansi} onChange={(e) => onInputChange(e, 'nomorKwitansi')} required className={classNames({'p-invalid' : submitted && !kwitansi.nomorKwitansi})} />
                            {submitted && !kwitansi.nomorKwitansi && <small className="p-invalid">Nomor Kwitansi harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="untuk_pembayaran">Untuk Pembayaran</label>
                            <InputTextarea rows={5} cols={30} value={kwitansi.keperluan} onChange={(e) => onInputChange(e, 'keperluan')} autoResize required className={classNames({'p-invalid' : submitted && !kwitansi.keperluan})} />
                            {submitted && !kwitansi.keperluan && <small className="p-invalid">Keperluan harus diisi</small>}
                        </div>      
                        <div className="field">
                            <label htmlFor="tanggal_kwitansi">Tanggal Bayar</label>
                            <Calendar id='icon' readOnlyInput dateFormat='dd/mm/yy' value={kwitansi.tanggalBayar !== "" ? new Date(kwitansi.tanggalBayar) : null} showIcon onChange={(e) => tanggalChange(e.value, 'tanggalBayar')} className={classNames({'p-invalid' : submitted && !kwitansi.tanggalBayar})}></Calendar>
                            {submitted && !kwitansi.tanggalBayar && <small className="p-invalid">Tanggal Bayar harus dipilih</small>}
                        </div>                  
                        {/* <div className="field">
                            <label htmlFor="template">Pejabat Yang Menandatangani</label>
                            <Dropdown value={kwitansi.pejabatId} options={dataPejabatTest} onChange={(e) => onInputChange(e, 'pejabatId')} disabled={(editMode && kwitansi.jenis === "test") || nonGabunganMode} optionLabel="option" optionValue="value" placeholder="Pilih pejabat yang menandatangani" required className={classNames({ 'p-invalid': submitted && !kwitansi.pejabatId })} />
                            {submitted && !kwitansi.pejabatId && <small className="p-invalid">Pejabat yang menandatangani harus dipilih harus dipilih</small>}
                        </div> */}
                    </Dialog>

                    {/* DIALOG DELETE DATA */}
                    <Dialog visible={deleteKwitansiDialog} blockScroll={true} closable={!confirmLoading} style={{ width: '450px' }} header="Konfirmasi" modal footer={deleteKwitansiDialogFooter} onHide={hideDeleteKwitansiDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {kwitansi && (
                                <span>
                                    Apakah anda yakin ingin menghapus data Kwitansi ini?
                                </span>
                            )}
                        </div>
                    </Dialog>


                    {/* RINCIAN DIALOG */}
                    <Dialog visible={rincianDialog} blockScroll={true} className="p-fluid" closable={!confirmLoading} style={{ width: '700px' }} header="Data Rincian Kwitansi" modal footer={rincianKwitansiDialogFooter} onHide={hideRincianDialog}>
                        <div className="field">
                            <div>
                                {formElements?.map((element) => (
                                    <div key={element.id} className='field'>
                                        <label htmlFor="jenis">Jenis Pembayaran</label>
                                        <Dropdown value={element.jenis} options={jenisPembayaran} onChange={(e) => handleInputChange(element.id, 'jenis', e.target.value)} autoFocus optionLabel="option" optionValue="value" placeholder="Pilih jenis pembayaran" />

                                        <label htmlFor="namaRincian">Nama Rincian</label>
                                        <InputText value={element.namaRincian} onChange={(e) => handleInputChange(element.id, 'namaRincian', e.target.value)} />

                                        <label htmlFor="jumlahBayar">Jumlah Bayar</label>
                                        <InputNumber value={element.jumlahBayar} onChange={(e) => handleInputChange(element.id, 'jumlahBayar', e.value)} />

                                        <label htmlFor="banyaknya">Banyaknya</label>
                                        <InputNumber value={element.banyaknya} onChange={(e) => handleInputChange(element.id, 'banyaknya', e.value)} showButtons />

                                        <label htmlFor="hasilBayar">Hasil Bayar</label>
                                        <InputNumber value={element.hasilBayar} disabled />

                                        <Button label='Hapus form pengisian' icon="pi pi-times" className='p-button-danger mt-3' onClick={() => handleRemoveFormElement(element.id)} />
                                    </div>
                                ))}
                                <Divider type='solid' />
                                <Button label="Tambah form pengisian" icon="pi pi-plus" onClick={handleAddFormElement} />
                            </div>         
                        </div>
                    </Dialog>

                    {/* RINCIAN PENERBANGAN DIALOG */}
                    <Dialog visible={rincianPenerbanganDialog} blockScroll={true} className="p-fluid" closable={!confirmLoading} style={{ width: '700px' }} header="Data Rincian Kwitansi" modal footer={rincianKwitansiPenerbanganDialogFooter} onHide={hideRincianPenerbanganDialog}>
                        <div className="field">
                            <div>
                                {formElementPenerbangan?.map((element) => (
                                    <div key={element.id} className='field'>
                                        <label htmlFor="namaMaskapai">Nama Maskapai</label>
                                        <InputText value={element.namaMaskapai} onChange={(e) => handleInputChangePenerbangan(element.id, 'namaMaskapai', e.target.value)} autoFocus />

                                        <label htmlFor="nomorTiket">Nomor Tiket</label>
                                        <InputText value={element.nomorTiket} onChange={(e) => handleInputChangePenerbangan(element.id, 'nomorTiket', e.target.value)} />

                                        <label htmlFor="kodeBooking">Kode Booking</label>
                                        <InputText value={element.kodeBooking} onChange={(e) => handleInputChangePenerbangan(element.id, 'kodeBooking', e.target.value)} showButtons />

                                        <Button label='Hapus form pengisian' icon="pi pi-times" className='p-button-danger mt-3' onClick={() => handleRemoveFormElementPenerbangan(element.id)} />
                                    </div>
                                ))}
                                <Divider type='solid' />
                                <Button label="Tambah form pengisian" icon="pi pi-plus" onClick={handleAddFormElementPenerbangan} />
                            </div>         
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;

let PizZipUtils = null;

if (typeof window !== "undefined") {
import("pizzip/utils/index.js").then(function (r) {
    PizZipUtils = r;
});
}

function loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
}

 //TEMPLATEING DOCUMENT
 const generateDocument = async (rowData) => {

    const tahunReverse = (string) => {
        return string.split('/').reverse().join('/')
    }

    const convertToRupiah = (angka) => {
        let rupiah = ''
        const angkaRev = angka.toString().split('').reverse().join('')

        for (let i = 0; i < angkaRev.length; i++) {
            if (i % 3 === 0) {
                rupiah += angkaRev.substr(i, 3) + '.'
            }
        }

        return (rupiah.split('', rupiah.length - 1).reverse().join(''))
    }
    
    const responseRincianKwitansi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/rinciankwitansi/search?kwitansiId=${rowData.id}`, {withCredentials:true})
    const rincians = responseRincianKwitansi.data
    
    for (let i = 0; i < rincians.length; i++) {
        rincians[i].jumlahBayar = convertToRupiah(rincians[i].jumlahBayar)
        rincians[i].hasilBayar = convertToRupiah(rincians[i].hasilBayar)
    }

    const pejabatResponse = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pejabat/search?jabatan=Pengguna Anggaran&jabatan=Bendahara Pengeluaran`, {withCredentials:true})
    const pejabatResponseData = pejabatResponse.data

    let pejabatBendaharaPengeluaran
    let pejabatPenggunaAnggaran

    for (let i = 0; i < pejabatResponseData.length; i++) {
        if (pejabatResponseData[i].jabatan === "Bendahara Pengeluaran") {
            pejabatBendaharaPengeluaran = pejabatResponseData[i]
        } else {
            pejabatPenggunaAnggaran = pejabatResponseData[i]
        }        
    }

    const responseTerbilang = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/convertnumbertowords?number=${rowData.totalBayar}`, {withCredentials:true})
    const terbilang = responseTerbilang.data

    let documentTemplate = 'kwitansi-formatted'

    // ditugaskan.forEach((arrayItem) => {
        loadFile(`/document/${documentTemplate}.docx`, function (
        error,
        content
        ) {
        if (error) {
            throw error;
        }
        var zip = new PizZip(content);
        var doc = new Docxtemplater().loadZip(zip);
        doc.setData({
            nomor_kwitansi : rowData.nomorKwitansi,
            uang : terbilang,
            keperluan : rowData.keperluan,
            rincians : rincians,
            total_bayar : convertToRupiah(rowData.totalBayar),
            tanggal_bayar : tahunReverse(rowData.tanggalBayar),
            pptk : rowData.sppd.spt.subKegiatan.pejabat.nama,
            nip_pptk : rowData.sppd.spt.subKegiatan.pejabat.nip,
            bendahara : pejabatBendaharaPengeluaran.nama,
            nip_bendahara : pejabatBendaharaPengeluaran.nip,
            penerima : rowData.sppd.pegawai.nama,
            nip_penerima : rowData.sppd.pegawai.nip,
            pengguna_anggaran : pejabatPenggunaAnggaran.nama,
            nip_pengguna_anggaran : pejabatPenggunaAnggaran.nip,            
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
        saveAs(out, `kwitansi-${rowData.nomorKwitansi}.docx`);
        });
    // })
    
};