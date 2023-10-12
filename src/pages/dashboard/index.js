import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { Menu } from 'primereact/menu';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { useRouter } from 'next/router';
import { DataTable } from 'primereact/datatable';

import axios from 'axios';

const Dashboard = () => {
    const [displayBasic, setDisplayBasic] = useState(false)
    const [displayBasic1, setDisplayBasic1] = useState(false)

    const dialogFuncMap = {
        'displayBasic' : setDisplayBasic,
        'displayBasic1' : setDisplayBasic1,
    }

    const toast = useRef(null)
    const router = useRouter()
    const [session, setSession] = useState(null)
    const [dataPegawai, setDataPegawai] = useState(null)

    const [dataSpt, setDataSpt] = useState(null)
    const [jumlahSpt, setJumlahSpt] = useState(null)
    const [jumlahSptBelumSppd, setJumlahSptBelumSppd] = useState(null)
    
    const [dataSppd, setDataSppd] = useState(null)
    const [jumlahSppd, setJumlahSppd] = useState(null)
    const [jumlahSppdBelumKwitansi, setJumlahSppdBelumKwitansi] = useState(null)

    const [jumlahKwitansi, setJumlahKwitansi] = useState(null)
    // const [jumlahKwitansiBelumRincian, setJumlahKwitansiBelumRincian] = useState(null)

    const [realisasi, setRealisasi] = useState(0)

    const getSession = async () => {
        try {
            const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
            if (responseSession.data) { 
                setSession(responseSession.data)
                getPegawai(responseSession.data.id, responseSession.data.role)
                getInfoDashboard(responseSession.data.id, responseSession.data.role)
            }
        } catch (error) {
            router.push("/")
        }
    }

    const getPegawai = async (id, role) => {
        if (role === "admin") {
            const responsePegawai = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pegawai/jumlahperjalanan`, {withCredentials: true})
            if (responsePegawai.data) {
                setDataPegawai(responsePegawai.data)
            }
        } else {
            const responsePegawai = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/pegawai/jumlahperjalanan?userId=${id}`, {withCredentials: true})
            if (responsePegawai.data) {
                setDataPegawai(responsePegawai.data)
            }
        }
    }

    const onHide = (name) => {
        dialogFuncMap[`${name}`](false);
    }

    const onClick = (name, position) => {
        dialogFuncMap[`${name}`](true);

    }

    const renderFooter = (name) => {
        return (
            <div>
                <Button label="Ok" onClick={() => onHide(name)} autoFocus />
            </div>
        );
    }

    const getInfoDashboard = async (id, role) => {
        try {
            if (role !== "admin") {
                const responseSpt = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/search?statusSppd=0&userId=${id}`, {withCredentials: true})
                setDataSpt(responseSpt.data)                

                const responseJumlahSpt = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/count/search?userId=${id}`, {withCredentials: true})            
                setJumlahSpt(responseJumlahSpt.data)
        
                const responseJumlahSptBelumSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/count/search?userId=${id}&statusSppd=0`, {withCredentials: true})
                setJumlahSptBelumSppd(responseJumlahSptBelumSppd.data)

                const responseSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/search?statusKwitansi=0&userId=${id}`, {withCredentials: true})
                setDataSppd(responseSppd.data)

                const responseJumlahSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/count/search?userId=${id}`, {withCredentials: true})
                setJumlahSppd(responseJumlahSppd.data)

                const responseJumlahSppdBelumKwitansi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/count/search?userId=${id}&statusKwitansi=0`, {withCredentials: true})
                setJumlahSppdBelumKwitansi(responseJumlahSppdBelumKwitansi.data)

                const responseJumlahKwitansi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/kwitansi/count/search?userId=${id}`, {withCredentials: true})
                setJumlahKwitansi(responseJumlahKwitansi.data)

                const responseRealisasi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/kwitansi/realisasi?userId=${id}`, {withCredentials: true})
                setRealisasi(responseRealisasi.data)
            } else {
                const responseSpt = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/search?statusSppd=0`, {withCredentials: true})
                setDataSpt(responseSpt.data)

                const responseJumlahSpt = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/count/search?all=true`, {withCredentials: true})
                setJumlahSpt(responseJumlahSpt.data)

                const responseJumlahSptBelumSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/spt/count/search?statusSppd=0`, {withCredentials: true})
                setJumlahSptBelumSppd(responseJumlahSptBelumSppd.data)

                const responseSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/search?statusKwitansi=0`, {withCredentials:true})
                setDataSppd(responseSppd.data)

                const responseJumlahSppd = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/count/search?all=true`, {withCredentials: true})
                setJumlahSppd(responseJumlahSppd.data)

                const responseJumlahSppdBelumKwitansi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/sppd/count/search?statusKwitansi=0`, {withCredentials: true})
                setJumlahSppdBelumKwitansi(responseJumlahSppdBelumKwitansi.data)

                const responseJumlahKwitansi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/kwitansi/count/search?all=true`, {withCredentials: true})
                setJumlahKwitansi(responseJumlahKwitansi.data)

                const responseRealisasi = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/kwitansi/realisasi?all=true`, {withCredentials:true})
                setRealisasi(responseRealisasi.data)
            }    
        } catch (error) {
            console.log(error)
            toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Terjadi kesalahan', life: 3000 });
        }
    }

    useEffect(() => {
        getSession()
    }, []);

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

    const tahunReverseTanggalSpt = (rowData) => {
        const tanggal = rowData.tanggal_spt
        return tanggal.split('/').reverse().join('/')
    }

    const tahunReverseTanggalBerangkat = (rowData) => {
        const tanggal = rowData.tanggal_berangkat
        return tanggal.split('/').reverse().join('/')
    }

    const tahunReverseTanggalKembali = (rowData) => {
        const tanggal = rowData.tanggal_kembali
        return tanggal.split('/').reverse().join('/')
    }

    const tahunReverseTanggalSppd = (rowData) => {
        const tanggal = rowData.tanggal_sppd
        return tanggal.split('/').reverse().join('/')
    }

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className='col-12'>
                <div className='card'>
                    {/* <h1><center>Welcome To SIPERJADIN APP</center></h1> */}
                    <h1><center></center></h1>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-4">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Jumlah SPT</span>
                            <div className="text-900 font-medium text-xl">{jumlahSpt}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            {/* <i className="pi pi-file text-blue-500 text-xl" /> */}
                            <Button icon="pi pi-file" className='p-button-success' onClick={() => onClick('displayBasic')} />
                            <Dialog header="Data SPT" visible={displayBasic} style={{ width: '50vw' }} footer={renderFooter('displayBasic')} onHide={() => onHide('displayBasic')}>
                                <DataTable value={dataSpt} rows={5} paginator responsiveLayout="scroll" style={{width:'600px'}}>
                                    <Column field="nomor_spt" header="Nomor SPT" style={{ width: '50%'}} />
                                    <Column field="tanggal_spt" header="Tanggal SPT" body={tahunReverseTanggalSpt} style={{ width: '50%'}} />
                                    <Column field="tanggal_berangkat" header="Tanggal Berangkat" body={tahunReverseTanggalBerangkat} style={{ width: '50%'}} />
                                    <Column field="tanggal_kembali" header="Tanggal Kembali" body={tahunReverseTanggalKembali} style={{ width: '50%'}} />
                                    <Column field="lama_perjalanan" header="Lama Perjalanan" style={{ width: '50%'}} />
                                </DataTable>
                            </Dialog>
                        </div>
                    </div>
                    <div>
                        <span className="text-red-500 font-medium">{jumlahSptBelumSppd}</span>
                        <span className="text-500"> belum memiliki SPPD</span>
                    </div>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-4">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Jumlah SPPD</span>
                            <div className="text-900 font-medium text-xl">{jumlahSppd}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            {/* <i className="pi pi-file text-orange-500 text-xl" /> */}
                            <Button icon="pi pi-file" className='p-button-info' onClick={() => onClick('displayBasic1')}/>
                            <Dialog header="Data SPPD" visible={displayBasic1} style={{ width: '50vw' }} footer={renderFooter('displayBasic1')} onHide={() => onHide('displayBasic1')}>
                                <DataTable value={dataSppd} rows={5} paginator responsiveLayout="scroll" style={{width:'600px'}}>
                                    <Column field="spt.nomor_spt" header="Nomor SPT" style={{ width: '50%'}} />
                                    <Column field="nomor_sppd" header="Nomor SPPD" style={{ width: '50%'}} />
                                    <Column field="jenis" header="Jenis SPPD" style={{ width: '50%'}} />
                                    <Column field="tanggal_sppd" header="Tanggal SPPD" body={tahunReverseTanggalSppd} style={{ width: '50%'}} />
                                    <Column field="tempat_berangkat" header="Tempat Berangkat" style={{ width: '50%'}} />
                                    <Column field="tempat_tujuan" header="Tempat Tujuan" style={{ width: '50%'}} />
                                    <Column field="alat_angkutan" header="Alat Angkutan" style={{ width: '50%'}} />
                                </DataTable>
                            </Dialog>
                        </div>
                    </div>
                    <span className="text-red-500 font-medium">{jumlahSppdBelumKwitansi}</span>
                    <span className="text-500"> belum memiliki kwitansi</span>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-4">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Jumlah Kwitansi</span>
                            <div className="text-900 font-medium text-xl">{jumlahKwitansi}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            {/* <i className="pi pi-file text-green-500 text-xl" /> */}
                            <Button icon="pi pi-file" className='p-button-help' />
                        </div>
                    </div>
                    {/* <span className="text-red-500 font-medium">{jumlahKwitansiBelumRincian} </span>
                    <span className="text-500"> belum memiliki rincian biaya</span> */}
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-5">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Realisasi</span>
                            <div className="text-900 font-medium text-xl">Rp. {convertToRupiah(realisasi)}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-dollar text-green-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-7">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <h5>Data Pegawai</h5>
                            <DataTable value={dataPegawai} rows={5} paginator responsiveLayout="scroll" style={{width:'500px'}}>
                                <Column field="nama" header="Nama Pegawai" style={{ width: '50%' }} />
                                <Column field="nip" header="NIP" style={{ width: '50%' }} />
                                <Column field="bidang" header="Bidang" style={{ width: '50%' }} />
                                <Column field="jumlahPerjalanan" header="Jumlah Perjalanan" style={{ width: '50%'}} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
