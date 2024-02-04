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
import useSWR, { useSWRConfig } from 'swr';
import axios from 'axios';
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";
import { InputTextarea } from 'primereact/inputtextarea';
import { useRouter } from 'next/router';

const Crud = () => {

    let emptySppd = {
        template_sppd: '',
        jenis: '',
        nomor_sppd: '',
        pegawaiId: '',
        tanggal_sppd: '',
        tempat_berangkat : '',
        tempat_tujuan : '',
        alat_angkutan: '',
        instansi: '',
        pejabatId: '',
        statusKwitansi: 0,
        sptId: '',
        userId: '',
        tahun: '',
    }

    const router = useRouter()
    const [disabledTombol, setDisabledTombol] = useState(false)
    const [session, setSession] = useState(null)

    const [sppds, setSppds] = useState(null);
    const [sppdDialog, setSppdDialog] = useState(false);
    const [detailSppdDialog, setDetailSppdDialog] = useState(false);
    const [sppd, setSppd] = useState(emptySppd);
    const [submitted, setSubmitted] = useState(false);
    const [deleteSppdDialog, setDeleteSppdDialog] = useState(false);

    const [editMode, setEditMode] = useState(false);
    const [nonGabunganMode, setNonGabunganMode] = useState(false);
    const [nomorSpt, setNomorSpt] = useState("");
    const [ditugaskan, setDitugaskan] = useState("");
    
    const [minDateTanggalSppd, setMinDateTanggalSppd] = useState(null)

    const template = [
        {option:"Kepala Badan", value: "Kepala Badan"},
        {option:"Non Kepala Badan", value: "Non Kepala Badan"},
    ]

    const jenis = [
        {option:"Gabungan", value: "Gabungan"},
        {option:"Non Gabungan", value: "Non Gabungan"},
    ]

    const alatAngkutan = [
        {option:"Kapal Laut", value: "Kapal Laut"},
        {option:"Mobil", value: "Mobil"},
        {option:"Motor", value: "Motor"},
        {option:"Pesawat", value: "Pesawat"},
    ]

    const instansiDrop = []
    const [dataInstansiTest, setDataInstansiTest] = useState(null)
    const pejabatDrop = []
    const [dataPejabatTest, setDataPejabatTest] = useState(null)
    const sptDrop = []
    const [dataSptTest, setDataSptTest] = useState(null)
    const pilihPegawaiGabungan = []
    const [pegawaiGabungan, setPegawaiGabungan] = useState(null)

    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const [simpanLoading, setSimpanLoading] = useState(false)
    const [uploadLoading, setUploadLoading] = useState(false)

    const [filter, setFilter] = useState(null)
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    const [noSppd, setNoSppd] = useState(null)
    const [tahun, setTahun] = useState(null);
    const tahuns = [
        {option: "2023", value: "2023"},
        {option: "2024", value: "2024"}
    ]

    const getSession = async () => {
        try {
            const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
            if (responseSession.data) {
                getSppd(responseSession.data.id)
                getSpt(responseSession.data.id)
                getInstansi()
                getPejabat()
                setSession(responseSession.data)
            } else {
                router.push("/")    
            }
        } catch (error) {
            router.push("/")
        }
    }

    const getSppd = async (id) => {
        if (id === 8) {
            const responseSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd`, {withCredentials: true})
            if (responseSppd.data) {
                setSppds(responseSppd.data)
            } else {
                setSppds(null)
            }
            setDisabledTombol(true)
            setLoading(false)
        } else {
            const responseSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/search?userId=${id}`, {withCredentials: true})
            if (responseSppd.data) {
                setSppds(responseSppd.data)
                setLoading(false)
            } else {
                setSppds(null)
                setLoading(false)
            }
        }
    }

    const getSppdByTahun = async (tahun) => {
        const id = session.id

        if (tahun) {
            if (id === 8) {
                const responseSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/search?tahun=${tahun}`, {withCredentials: true})
                if (responseSppd.data) {
                    setSppds(responseSppd.data)
                    setDisabledTombol(true)
                } else {
                    setSppds(null)
                    setDisabledTombol(true)
                }
                setLoading(false)
            } else {
                const responseSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/search?userId=${id}&tahun=${tahun}`, {withCredentials: true})
                if (responseSppd.data) {
                    setSppds(responseSppd.data)
                    setLoading(false)
                } else {
                    setSppds(null)
                    setLoading(false)
                }
            }
        } else {
            getSppd(id)
        }
        setNoSppd("")
        setTahun(tahun)
    }

    const getSppdByNomorSppd = async (nomorSppd) => {
        const id = session.id

        if (nomorSppd) {
            if (id === 8) {
                const responseSppd = ""
                if (tahun) {
                    responseSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/search?nomor_sppd=${nomorSppd}&tahun=${tahun}`, {withCredentials: true})
                } else {
                    responseSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/search?nomor_sppd=${nomorSppd}`, {withCredentials: true})
                }
                if (responseSppd.data) {
                    setSppds(responseSppd.data)
                    setDisabledTombol(true)
                } else {
                    setSppds(null)
                    setDisabledTombol(true)
                }
                setLoading(false)
            } else {
                const responseSppd = ""
                if (tahun) {
                    responseSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/search?userId=${id}&nomor_sppd=${nomorSppd}&tahun=${tahun}`, {withCredentials: true})
                } else {
                    responseSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/search?userId=${id}&nomor_sppd=${nomorSppd}`, {withCredentials: true})
                }
                if (responseSppd.data) {
                    setSppds(responseSppd.data)
                    setLoading(false)
                } else {
                    setSppds(null)
                    setLoading(false)
                }
            }
        } else {
            getSppd(id)
            setTahun(null)
        }
    }

    const getSpt = async (id) => {
        if (id !== 8) {
            const responseSpt = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/search?statusSppd=0&userId=${id}`, {withCredentials: true})
            if (responseSpt.data) {
                responseSpt.data?.map(d => (
                    sptDrop.push({option:d.nomor_spt, value:d.id})
                ))
            }
            setDataSptTest(sptDrop)
        }
    }

    const getInstansi = async () => {
        const responseInstansi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/instansi`, {withCredentials: true})
        if (responseInstansi.data) {
            responseInstansi.data?.map(d => (
                instansiDrop.push({option: d.instansi, value: d.instansi})
            ))
        }
        setDataInstansiTest(instansiDrop)
    }

    const getPejabat = async () => {
        const responsePejabat = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pejabat`, {withCredentials: true})
        if (responsePejabat.data) {
            responsePejabat.data?.map(d => (
                pejabatDrop.push({option: d.nama + " - " + d.jabatan, value: d.id})
            ))
        }
        setDataPejabatTest(pejabatDrop)
    }

    useEffect(() => {
        getSession()
    }, []);

    const openNew = () => {
        setSppd(emptySppd);
        setSubmitted(false);
        setSppdDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setSppdDialog(false);
        setDetailSppdDialog(false);

        setEditMode(false);
        setNonGabunganMode(false);
        setNomorSpt("")
        setDitugaskan("")
    };

    const saveSppd = async () => {
        setSubmitted(true);

        sppd.userId = session.id

        if (sppd.template_sppd && sppd.jenis && sppd.nomor_sppd && sppd.tanggal_sppd && sppd.tempat_berangkat && sppd.pegawaiId && sppd.tempat_tujuan && sppd.alat_angkutan && sppd.instansi && sppd.pejabatId && sppd.sptId && sppd.userId) {

            setSimpanLoading(true)

            if (sppd.id) {
                const id = sppd.id;

                if (sppd.jenis === "Gabungan") {
                    try {
                        const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/${id}`, sppd, {withCredentials:true})
                        if (response.status === 200){
                            getSppd(session.id)
                            toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPPD Berhasil Diperbarui', life: 3000 });
                        }
                    } catch (error) {
                        toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data SPPD Gagal Diperbarui', life: 3000 });
                    }
                }
                else {
                    try {
                        // const response1 = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/count?sptid=${sppd.sptId}`, {withCredentials:true})
                        // if (response1.status === 200) {
                        //     if (response1.data > 1) {
                        //         sppd.nomor_sppd = ''
                        //         sppd.pegawaiId = 0
                        //     }
                        // }

                        // const response2 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/updatebysptid/${sppd.sptId}`, sppd, {withCredentials:true})
                        // if (response2.status === 200 ) {
                        //     getSppd(session.id)
                        //     toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPPD Berhasil Diperbarui', life: 3000 });
                        // }

                        const response3 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/${sppd.id}`, sppd, {withCredentials:true})
                    } catch (error) {                        
                        toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data SPPD Gagal Diperbarui', life: 3000 });
                    }
                }
            } else {
                try {
                    const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd`, sppd, {withCredentials:true})
                    if (response.status === 201) {
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPPD Berhasil Disimpan', life: 3000 });
                        if (sppd.jenis === "Gabungan") {
                            const response1 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/updatestatus/${sppd.sptId}/${1}`, {}, {withCredentials:true})
                            if (response1.status === 200) {
                                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPT Berhasil Diperbarui', life: 3000 });

                                const response2 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/updatestatus/${sppd.sptId}/${1}`, {}, {withCredentials:true})
                                if (response2.status === 200) {
                                    toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Pegawai Ditugaskan Berhasil Diperbarui', life: 3000 });
                                }
                            }
                        } else {
                            let jumlahDataDitugaskan, jumlahDataSppd = 0

                            const responseDataDitugaskan = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/count?sptid=${sppd.sptId}`, {withCredentials:true})
                            if (responseDataDitugaskan.status === 200) {
                                jumlahDataDitugaskan = responseDataDitugaskan.data

                                const responseDataSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/count?sptid=${sppd.sptId}`, {withCredentials:true})
                                if (responseDataSppd.status === 200) {
                                    jumlahDataSppd = responseDataSppd.data
                                }

                                if (jumlahDataSppd === jumlahDataDitugaskan) {
                                    const response3 = await axios.patch(process.env.
                                        NEXT_PUBLIC_BASE_URL_API + `/spt/updatestatus/${sppd.sptId}/${1}`, {}, {withCredentials:true})
                                    if (response3.status === 200) {
                                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPT Berhasil Diperbarui', life: 3000 });
                                    }
                                }
                            }
                            
                            const response4 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/updatestatus/${sppd.sptId}/${1}?pegawaiid=${sppd.pegawaiId}`, {}, {withCredentials:true})
                            if (response4.status === 200) {
                                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Pegawai Ditugaskan Berhasil Diperbarui', life: 3000 });
                            }
                        }
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Data SPPD Gagal Disimpan', life: 3000 });
                }
            }

            getSppd(session.id)
            getSpt(session.id)

            setSimpanLoading(false)
            hideDialog();
            setSppdDialog(false);
            setSppd(emptySppd);
        }
    };

    const editSppd = (dataSppd) => {
        setSppd({ ...dataSppd });
        setSppdDialog(true);
        setEditMode(true)
        setNomorSpt(dataSppd.spt.nomor_spt)
        setDitugaskan(dataSppd.pegawai.nama)
    };

    const deleteSppd = async () => {
        setConfirmLoading(true)

        try {
            const response1 = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/${sppd.id}`, {withCredentials:true})
            if (response1.status === 200) {
                toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPPD  Berhasil Dihapus', life: 3000 });

                if (sppd.jenis === "Gabungan") {
                    const response2 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/updatestatus/${sppd.sptId}/${0}`, {}, {withCredentials:true})
                    if (response2.status === 200) {

                        const response3 =  await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/updatestatus/${sppd.sptId}/${0}`, {}, {withCredentials:true})
                        if (response3.status === 200) {
                            toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPT Berhasil Diperbarui', life: 3000 });
                        }

                        const response0 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/updatestatuskwitansi/${sppd.sptId}/${0}`, {}, {withCredentials:true})
                        if (response0.status === 200) {
                            toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Ditugaskan Berhasil Diperbarui', life: 3000 });
                        }
                    }
                } else {
                    const response4 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/updatestatus/${sppd.sptId}/${0}?pegawaiid=${sppd.pegawaiId}`, {}, {withCredentials:true})
                    if (response4.status === 200) {
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data Ditugaskan Berhasil Diperbarui', life: 3000 });

                        const response5 = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/count?sptid=${sppd.sptId}`, {withCredentials:true})

                        const response6 = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/count?sptid=${sppd.sptId}`, {withCredentials:true})


                        if (response5.status === 200 && response6.status === 200) {

                            const jumlahSppdBySptId = response5.data
                            const jumlahDataDitugaskanBySptId = response6.data

                            if (jumlahSppdBySptId === 0 || jumlahDataDitugaskanBySptId > jumlahSppdBySptId ) {
                                const response6 = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/updatestatus/${sppd.sptId}/${0}`, {}, {withCredentials:true})
                                if (response6.status === 200) {
                                    toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Data SPT Berhasil Diperbarui', life: 3000 });
                                }
                            } else {
                                
                            }
                        }
                    }
                }
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi Kesalahan Data Gagal Dihapus', life: 3000 });
        }

        getSppd(session.id)
        getSpt(session.id)

        setDeleteSppdDialog(false);
        setSppd(emptySppd);
        setConfirmLoading(false)
    }

    const confirmDeleteSppd = (sppd) => {
        setSppd(sppd)
        setDeleteSppdDialog(true)
    }
    
    const hideDeleteSppdDialog = () => {
        setDeleteSppdDialog(false)
    }

    const seeDetailSppdDialog = (sppd) => {    
        setSppd({ ...sppd });
        setDetailSppdDialog(true);
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = async (e, name) => {

        if (name === "sptId") {
            try {
                const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/search?sptId=${e.value}`, {withCredentials:true}) 
                if (response.data === null) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Pegawai yang ditugaskan pada SPT ini tidak ada, Mohon memilih pegawai yang ditugaskan pada menu Surat Perintah Tugas', life: 3000 });
                } else {
                    const response1 = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/search?sptId=${e.value}&jenis=Non Gabungan`, {withCredentials:true}) 
                    if (response1.status === 200) {
                        if (response1.data === null) {

                            const responseSpt = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/${e.value}`, {withCredentials:true})

                            const tanggal = responseSpt.data.tanggal_spt

                            let date = new Date(new Date(tanggal).setDate(new Date(tanggal).getDate()))
                            setMinDateTanggalSppd(date)   

                            setNonGabunganMode(false) 
                            setDitugaskan("")                                   
                            const val = (e.target && e.target.value) || '';
                            let _sppd = { ...sppd };

                            _sppd[`${name}`] = val;
                            _sppd["jenis"] = ""
                            _sppd["pegawaiId"] = ""
                            _sppd["template_sppd"] = ""
                            _sppd["tanggal_sppd"] = ""
                            _sppd["tempat_berangkat"] = ""
                            _sppd["tempat_tujuan"] = ""
                            _sppd["alat_angkutan"] = ""
                            _sppd["instansi"] = ""
                            _sppd["pejabatId"] = ""

                            setSppd(_sppd);
                        } else {
                            setNonGabunganMode(true)

                            let dataSppd = response1.data[0]

                            const val = (e.target && e.target.value) || '';
                            let _sppd = { ...sppd }
                            
                            _sppd[`${name}`] = val;
                            _sppd["jenis"] = dataSppd.jenis
                            const response2 = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/search?sptId=${e.value}&statusSppd=0`, {withCredentials:true})
                            if (response2.status === 200) {
                                setDitugaskan(response2.data[0].namaPegawai)
                                _sppd["pegawaiId"] = response2.data[0].pegawaiId
                            }
                            _sppd["template_sppd"] = dataSppd.template_sppd
                            _sppd["tanggal_sppd"] = ambilTanggal(dataSppd.tanggal_sppd)
                            _sppd["tempat_berangkat"] = dataSppd.tempat_berangkat
                            _sppd["tempat_tujuan"] = dataSppd.tempat_tujuan
                            _sppd["alat_angkutan"] = dataSppd.alat_angkutan
                            _sppd["instansi"] = dataSppd.instansi
                            _sppd["pejabatId"] = dataSppd.pejabatId

                            setSppd(_sppd);
                            
                        } 
                    }                    
                }
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi Kesalahan', life: 3000 });
            }
        } else if (name === "jenis") {
            sppd.pegawaiId = ""
            if (e.value === "Gabungan") {
                try {
                    const response1 = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/search?sptId=${sppd.sptId}`, {withCredentials:true})
                    if (response1.status === 200) {
                        response1.data?.map(data => {
                            pilihPegawaiGabungan.push({option: data.namaPegawai , value: data.pegawaiId})
                        })
                        setPegawaiGabungan(pilihPegawaiGabungan)

                        const val = (e.target && e.target.value) || '';
                        let _sppd = { ...sppd };
                        _sppd[`${name}`] = val;
                        setSppd(_sppd);
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi Kesalahan', life: 3000 });
                }
            } else {
                try {
                    const response1 = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/search?sptId=${sppd.sptId}&statusSppd=0`, {withCredentials:true})
                    if (response1.status === 200) {
                        setDitugaskan(response1.data[0].namaPegawai)
                        sppd.pegawaiId = response1.data[0].pegawaiId
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi Kesalahan', life: 3000 });
                }

                const val = (e.target && e.target.value) || '';
                let _sppd = { ...sppd };
                _sppd[`${name}`] = val;
                setSppd(_sppd);
            }
        } else {
            const val = (e.target && e.target.value) || '';
            let _sppd = { ...sppd };
            _sppd[`${name}`] = val;
            setSppd(_sppd);
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

        let _sppd = { ...sppd };
        _sppd[`${name}`] = ambilTanggal(tanggal);
        
        // if(name === 'tanggal_spt'){
        //     let date = new Date(new Date(tanggal).setDate(new Date(tanggal).getDate() + 1))
        //     setMinDateBerangkat(date)
        // } else if (name === 'tanggal_berangkat') {
        //     let date = new Date(new Date(tanggal).setDate(new Date(tanggal).getDate() + 1))
        //     setMinDateKembali(date)
        // }

        setSppd(_sppd);
    }

    const tahunReverse = (string) => {
        return string?.split('/').reverse().join('/')
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Tambah Data SPPD" icon="pi pi-plus" className="p-button-primary p-button-raised mr-2" onClick={openNew} disabled={disabledTombol} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="card">
                    <h6>Tahun</h6>
                    <Dropdown value={tahun} options={tahuns} onChange={(e) => getSppdByTahun(e.value)} optionLabel="option" optionValue="value" showClear placeholder="Pilih tahun" />
                </div>
            </React.Fragment>
        );
    };

    const nomorSppdBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nomor SPPD</span>
                {rowData.nomor_sppd}
            </>
        );
    };

    const tanggalSppdBodyTemplate = (rowData) => {

        const tanggal_sppd = tahunReverse(rowData.tanggal_sppd)

        return (
            <>
               {tanggal_sppd}
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

    const nomorSptBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nomor SPT</span>
                {rowData.spt.nomor_spt}
            </>
        );
    };

    const jenisSppdBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Jenis SPPD</span>
                {rowData.jenis}
            </>
        );
    };

    const templateSppdBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Template SPPD</span>
                {rowData.template_sppd}
            </>
        );
    };

    // const tanggalSptBodyTemplate = (rowData) => {

    //     const tanggal_spt = tahunReverse(rowData.tanggal_spt)

    //     return (
    //         <>
    //            {tanggal_spt}
    //         </>
    //     );
    // };

    const tandaTanganBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Sub Kegiatan</span>
                {rowData.pejabat.nama}
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

    const ditugaskanBodyTemplate = (rowData) => {

        return (
            <>
                <span className="p-column-title">Ditugaskan Kepada</span>
                {rowData.pegawai.nama}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info mr-2" onClick={() => editSppd(rowData)} tooltip="Edit SPPD" tooltipOptions={{position:'top'}} disabled={disabledTombol} />
                {/* <Button icon="pi pi-send" className="p-button-rounded p-button-success mr-2" onClick={() => seeDetailSppdDialog(rowData)} tooltip="Detail SPPD" tooltipOptions={{position:'top'}} /> */}
                <Button icon="pi pi-file-word" className="p-button-rounded p-button-warning mr-2" onClick={() => checkingDocumentData(rowData)} tooltip="Download SPPD" tooltipOptions={{position:"top"}} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger mr-2 mt-2" onClick={() => confirmDeleteSppd(rowData)} tooltip="Hapus SPPD" tooltipOptions={{position: 'top'}} disabled={disabledTombol} />
            </>
        );
    };

    const checkingDocumentData = (rowData) => {
        if (rowData.template_sppd && rowData.nomor_sppd && rowData.tanggal_sppd && rowData.instansi && rowData.pejabatId) {
            generateDocument(rowData)
        } else {
            toast.current.show({ severity: 'warn', summary: 'Peringatan', detail: 'Mohon untuk melengkapi data SPPD', life: 3000 });
        }
    }

    // const initFilter = () => {
    //     setFilter({
    //         'global' : {value : null, matchMode : FilterMatchMode.CONTAINS}
    //     })
    // }

    // const onGlobalFilterChange = (e) => {
    //     const value = e.target.value;
    //     let _filter = { ...filter };
    //     _filter['global'].value = value;

    //     setFilter(_filter);
    //     setGlobalFilter(value);
    // }

    const onNoSppdOnChange = (e) => {
        const value = e.target.value
        
        setNoSppd(value);
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Data SPPD</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={noSppd} onChange={onNoSppdOnChange} placeholder="Cari nomor SPPD" />
                <Button label="Cari" className="p-button-text p-button-raised ml-2" onClick={() => getSppdByNomorSppd(noSppd)} />
            </span>
        </div>
    );

    const sppdDialogFooter = (
        <>
            <Button label="Batal" icon="pi pi-times" disabled={simpanLoading} className="p-button-text p-button-raised" onClick={hideDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={simpanLoading} className="p-button-text p-button-raised" onClick={saveSppd} />
        </>
    );

    const deleteSppdDialogFooter = (
        <>
            <Button label="Tidak" icon="pi pi-times" disabled={confirmLoading} className="p-button-raised p-button-text" onClick={hideDeleteSppdDialog} />
            <Button label="Ya" icon="pi pi-check" loading={confirmLoading} className="p-button-raised p-button-text" onClick={deleteSppd} />
        </>
    );

    const detailSppdDialogFooter = (
        <>
            <Button label="Tutup" className="p-button-text p-button-raised" onClick={hideDialog} />
        </>
    );

    const uploadSuratTugas = (sppd) => {
        setSppd(sppd);
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
                        value={sppds}
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
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '13rem' }}></Column>
                        <Column field="nomor_spt" header="Nomor SPT" sortable body={nomorSptBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="jenisSppd" header="Jenis SPPD" sortable body={jenisSppdBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="ditugaskan" header="Ditugaskan Kepada" sortable body={ditugaskanBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="templateSppd" header="Template SPPD" sortable body={templateSppdBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="nomor_sppd" header="Nomor SPPD" sortable body={nomorSppdBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="tanggal_sppd" header="Tanggal SPPD" sortable body={tanggalSppdBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="tempat_berangkat" header="Tempat Berangkat" sortable body={tempatBerangkatBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="tempat_tujuan" header="Tempat Tujuan" sortable body={tempatTujuanBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="alat_angkutan" header="Alat Angkutan" sortable body={alatAngkutanBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="instansi" header="Instansi" sortable body={instansiBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="pejabatId" header="Yang Menandatangani" sortable body={tandaTanganBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                    </DataTable>

                    {/* DIALOG TAMBAH DAN EDIT DATA */}
                    <Dialog visible={sppdDialog} blockScroll={true} closable={!simpanLoading} style={{ width: '600px' }} header="Data SPPD" modal className="p-fluid" footer={sppdDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="spt">Nomor SPT</label>
                            {editMode ? (
                                <InputText value={nomorSpt} disabled={true} />
                            ) : (
                                <Dropdown value={sppd.sptId} options={dataSptTest} onChange={(e) => onInputChange(e, 'sptId')} autoFocus optionLabel="option" optionValue="value" placeholder="Pilih nomor SPT" filter required className={classNames({ 'p-invalid': submitted && !sppd.sptId })} />
                            )}
                            
                            {submitted && !sppd.sptId && <small className="p-invalid">Nomor SPT harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="jenis">Jenis SPPD</label>
                            <Dropdown value={sppd.jenis} options={sppd.sptId != "" ? jenis : null} onChange={(e) => onInputChange(e, 'jenis')} optionLabel="option"  disabled={editMode || nonGabunganMode} optionValue="value" placeholder="Pilih jenis SPPD" required className={classNames({ 'p-invalid': submitted && !sppd.jenis })} />
                            {submitted && !sppd.jenis && <small className="p-invalid">Jenis SPPD harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="nomor_sppd">Ditugaskan Kepada</label>
                            {sppd.jenis === "Gabungan" && !editMode ? (
                                <Dropdown value={sppd.pegawaiId} options={pegawaiGabungan} onChange={(e) => onInputChange(e, 'pegawaiId')} optionLabel="option" optionValue="value" placeholder="Pilih pegawai ditugaskan" required className={classNames({ 'p-invalid': submitted && !sppd.jenis })} />
                            ) : (
                                <InputText value={editMode || sppd.jenis !== "Gabungan" ? ditugaskan : sppd.pegawaiId} disabled={true} />
                            )} 
                        </div>
                        <div className="field">
                            <label htmlFor="template">Template SPPD</label>
                            <Dropdown value={sppd.template_sppd} options={template} onChange={(e) => onInputChange(e, 'template_sppd')} disabled={(editMode && sppd.jenis === "test") || nonGabunganMode} optionLabel="option" optionValue="value" placeholder="Pilih template SPPD" required className={classNames({ 'p-invalid': submitted && !sppd.template_sppd })} />
                            {submitted && !sppd.template_sppd && <small className="p-invalid">Template SPPD harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="nomor_sppd">Nomor SPPD</label>
                            <InputText value={sppd.nomor_sppd} onChange={(e) => onInputChange(e, 'nomor_sppd')} required className={classNames({'p-invalid' : submitted && !sppd.nomor_sppd})} />
                            {submitted && !sppd.nomor_sppd && <small className="p-invalid">Nomor SPPD harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tanggal_sppd">Tanggal SPPD</label>
                            <Calendar id='icon' readOnlyInput dateFormat='dd/mm/yy' value={sppd.tanggal_sppd !== "" ? new Date(sppd.tanggal_sppd) : null} showIcon onChange={(e) => tanggalChange(e.value, 'tanggal_sppd')} disabled={sppd.sptId === '' || editMode || nonGabunganMode} minDate={minDateTanggalSppd} className={classNames({'p-invalid' : submitted && !sppd.tanggal_sppd})}></Calendar>
                            {submitted && !sppd.tanggal_sppd && <small className="p-invalid">Tanggal SPPD harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tempat_berangkat">Tempat Berangkat</label>
                            <InputText value={sppd.tempat_berangkat} onChange={(e) => onInputChange(e, 'tempat_berangkat')} placeholder="Tempat Berangkat" disabled={(editMode && sppd.jenis === "test") || nonGabunganMode} required className={classNames({'p-invalid' : submitted && !sppd.tempat_berangkat})} />
                            {submitted && !sppd.tempat_berangkat && <small className="p-invalid">Tempat berangkat harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tempat_kembali">Tempat Tujuan</label>
                            <InputText value={sppd.tempat_tujuan} onChange={(e) => onInputChange(e, 'tempat_tujuan')} placeholder="Tempat Tujuan" disabled={(editMode && sppd.jenis === "test") || nonGabunganMode} required className={classNames({'p-invalid' : submitted && !sppd.tempat_tujuan})} />
                            {submitted && !sppd.tempat_tujuan && <small className="p-invalid">Tempat tujuan harus diisi</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="alat_angkutan">Alat Angkutan</label>
                            <Dropdown value={sppd.alat_angkutan} options={alatAngkutan} onChange={(e) => onInputChange(e, 'alat_angkutan')} disabled={(editMode && sppd.jenis === "test") || nonGabunganMode} optionLabel="option" optionValue="value" placeholder="Pilih alat angkutan" required className={classNames({ 'p-invalid': submitted && !sppd.alat_angkutan })} />
                            {submitted && !sppd.alat_angkutan && <small className="p-invalid">Alat angkutan harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="template">Intansi</label>
                            <Dropdown value={sppd.instansi} options={dataInstansiTest} onChange={(e) => onInputChange(e, 'instansi')} disabled={(editMode && sppd.jenis === "test") || nonGabunganMode} optionLabel="option" optionValue="value" placeholder="Pilih instansi" required className={classNames({ 'p-invalid': submitted && !sppd.instansi })} />
                            {submitted && !sppd.instansi && <small className="p-invalid">Instansi harus dipilih</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="template">Pejabat Yang Menandatangani</label>
                            <Dropdown value={sppd.pejabatId} options={dataPejabatTest} onChange={(e) => onInputChange(e, 'pejabatId')} disabled={(editMode && sppd.jenis === "test") || nonGabunganMode} optionLabel="option" optionValue="value" placeholder="Pilih pejabat yang menandatangani" required className={classNames({ 'p-invalid': submitted && !sppd.pejabatId })} />
                            {submitted && !sppd.pejabatId && <small className="p-invalid">Pejabat yang menandatangani harus dipilih harus dipilih</small>}
                        </div>
                    </Dialog>

                    {/* DIALOG DELETE DATA */}
                    <Dialog visible={deleteSppdDialog} blockScroll={true} closable={!confirmLoading} style={{ width: '450px' }} header="Konfirmasi" modal footer={deleteSppdDialogFooter} onHide={hideDeleteSppdDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {sppd && (
                                <span>
                                    Apakah anda yakin ingin menghapus data SPPD ini?
                                </span>
                            )}
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

    // let tanggal = tahunReverse(rowData.tanggal_sppd)
    let tahun = new Date().getFullYear()

    // let arrdDitugaskan = JSON.parse(rowData.ditugaskan)
    // let dataDitugaskanPromise = []
    // let dataFDitugaskan = []
    // let ditugaskan = []

    // let dataPejabat

    // try {
    //     dataPejabat = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pejabat/nama/${rowData.pejabat_pemberi}`, {withCredentials:true})
    // } catch (error) {
    //     console.log(error)
    // }

    // console.log(dataPejabat)

    // arrdDitugaskan.forEach(function (arrayItem) {
    //     dataDitugaskanPromise.push(axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pegawai/nama/${arrayItem.name}`, {withCredentials:true}))
    // });

    // try {
    //     dataFDitugaskan = await Promise.all(dataDitugaskanPromise)
    // }
    // catch (error) {
    //     console.log(error)
    // }

    // dataFDitugaskan.map((datas) => {
    //     ditugaskan.push(datas.data)
    // })

    let pengikuts
    let dataPengikut = []

    if (rowData.jenis === "Gabungan") {
        const dataPengikutResponse = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/dataditugaskan/pengikut?pegawaiId=${rowData.pegawaiId}&sptId=${rowData.sptId}`, {withCredentials:true})
        if (dataPengikutResponse.data) {
            pengikuts = dataPengikutResponse.data

            for (let i = 0; i < pengikuts.length; i++) {
                let test = i + 1

                dataPengikut[i] = {}
                dataPengikut[i].nomor = test
                dataPengikut[i].namaPegawai = pengikuts[i].pegawai.nama
            }
        }

    } 

    console.log(dataPengikut)

    let documentTemplate
    if (rowData.template_sppd === 'Kepala Badan') {
        documentTemplate = 'sppd-bappeda-kepalabadan-formatted'
    } else if (rowData.template_sppd === 'Non Kepala Badan') {
        documentTemplate = 'sppd-bappeda-nonkepalabadan-formatted'
    }

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
            nomor_sppd: rowData.nomor_sppd,
            tahun: tahun,
            nama_pemberi: rowData.pejabat.nama,
            nama_ditugaskan: rowData.pegawai.nama,
            pengikut : dataPengikut,
            pangkat: rowData.pegawai.pangkat,
            golongan: rowData.pegawai.golongan, 
            jabatan: rowData.pegawai.jabatan,
            keperluan: rowData.keperluan,
            alat_angkutan: rowData.alat_angkutan,
            tempat_berangkat: rowData.tempat_berangkat,
            tempat_tujuan: rowData.tempat_tujuan,
            lama_perjalanan: rowData.spt.lama_perjalanan,
            tanggal_berangkat: tahunReverse(rowData.spt.tanggal_berangkat),
            tanggal_kembali: tahunReverse(rowData.spt.tanggal_kembali),
            instansi: rowData.instansi,
            tanggal_sppd: tahunReverse(rowData.tanggal_sppd),
            jabatan_pemberi: rowData.pejabat.jabatan,
            golongan_pemberi: rowData.pejabat.golongan,
            nip_pemberi: rowData.pejabat.nip,
            nama_pptk: rowData.spt.subKegiatan.pejabat.nama,
            nip_pptk: rowData.spt.subKegiatan.pejabat.nip,
            keperluan: rowData.spt.keperluan,
            kode_rekening: rowData.spt.rekening.kodeRekening
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
        saveAs(out, `sppd-${rowData.pegawai.nama}.docx`);
        });
    // })
    
};