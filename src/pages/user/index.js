import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Toast } from 'primereact/toast';
import { Messages } from 'primereact/messages';
import { Password } from 'primereact/password';
import axios from 'axios';

const UserSetting = () => {
    const router = useRouter()
    const msgs = useRef(null)
    const toast = useRef(null);

    const userDrop = [];
    const [dataUser, setDataUser] = useState(null)
    const [dataUserDrop, setDataUserDrop] = useState(null)    

    const [showDropdown, setShowDropdown] = useState(null)
    const [disabledTombolUbah, setDisabledTombolUbah] = useState(true)
    const [loading, setLoading] = useState(false)

    const [passwordBaru, setPasswordBaru] = useState("")
    const [passwordUlang, setPasswordUlang] = useState("")
    const [passwordSama, setPasswordSama] = useState(true)

    const [submitted, setSubmitted] = useState(false)
    const [session, setSession] = useState(null)

    const getSession = async () => {
        try {
            const responseSession = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/auth/session`, {withCredentials: true})
            if (responseSession.data) {                    
                    getUser(responseSession.data.role)
                    setSession(responseSession.data)
                    msgs.current.show([{ severity: 'info', summary: '', detail: 'Password minimal 8 karakter', sticky: true, closable: false }])
            } else {
                router.push("/")    
            }
        } catch (error) {
            router.push("/")
        }
    }

    const getUser = async (role) => {
        if (role === "admin") {
            const responseUser = await axios.get(process.env.NEXT_PUBLIC_BASE_URL_API + `/user`, {withCredentials: true})
            if (responseUser.data) {
                responseUser.data?.map(d => (
                    userDrop.push({option: d.username, value: d.id})
                ))
            }
            setDataUserDrop(userDrop)
            setShowDropdown(true)
        }  else {
            
        }
    }

    const handleInputPasswordBaru = (password) => {
        setPasswordBaru(password)
        cekKesamaan(password, passwordUlang)
    }

    const handleInputUlangPassword = (password) => {
        setPasswordUlang(password)
        cekKesamaan(passwordBaru, password)
    }

    const cekKesamaan = (passwordBaru, passwordUlang) => {
        if (passwordBaru === passwordUlang) {
            setPasswordSama(true)
            if (passwordBaru.length >= 8) {
                setDisabledTombolUbah(false)
            }
        } else {
            setPasswordSama(false)
            setDisabledTombolUbah(true)
        }
    }

    const ubahPassword = async () => {
        setSubmitted(true)

        if (session.role === "admin") {
            if (dataUser) {
                setLoading(true)
                try {
                    const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/user/${dataUser}`, {Password : passwordBaru}, {withCredentials:true})
                    if (response.data) {
                        toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Password Berhasil Diubah', life: 3000 });    
                    }
                    setDataUser(null)
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Password Gagal Diubah', life: 3000 });
                }
            }
        } else {
            setLoading(true)
            try {
                const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL_API + `/user/${session.id}`, {Password : passwordBaru}, {withCredentials:true})
                if (response.data) {
                    toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Password Berhasil Diubah', life: 3000 });    
                }
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Kesalahan', detail: 'Password Gagal Diubah', life: 3000 });
            }
        }
        
        setPasswordBaru("")
        setPasswordUlang("")

        setSubmitted(false)
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
                    <h3>Ubah Password</h3>
                        {showDropdown && (
                            <div className="field">
                                <Dropdown value={dataUser} options={dataUserDrop} onChange={(e) => setDataUser(e.value)} optionLabel="option" optionValue="value" placeholder="Pilih user" required className={classNames({ 'p-invalid': submitted && !dataUser })} />
                                {submitted && !dataUser && <small className="p-invalid">User harus dipilih</small>}
                            </div>  
                        )}
                    <div className="field">
                        <label htmlFor="passwordBaru">Password Baru</label>
                        <Password value={passwordBaru} onChange={(e) => handleInputPasswordBaru(e.target.value)} placeholder="Masukkan password baru" required toggleMask feedback={false}></Password>
                    </div>
                    <Messages ref={msgs} />
                    <div className="field">
                        <label htmlFor="ulangPasswordBaru">Ulang Password Baru</label>
                        <Password value={passwordUlang} onChange={(e) => handleInputUlangPassword(e.target.value)} placeholder="Ulangi Password" required toggleMask feedback={false} className={classNames({ 'p-invalid': !passwordSama })}></Password>
                        {!passwordSama && <small className="p-invalid">Password tidak sama</small>}
                    </div>
                    <div className="field">
                        <Button label="Ubah Password" disabled={disabledTombolUbah} onClick={ubahPassword} loading={loading} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSetting;
