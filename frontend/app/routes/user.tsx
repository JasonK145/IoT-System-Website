import axios from 'axios';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";

interface Props{
    title:string,
    onClick():void,
    
}

export default function Index() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [titleName, setTitle] = useState(searchParams.get('title') || '統計信息');
    const [first_name, setFirstName] = useState();
    const [last_name, setLastName] = useState();

    // logout 函數
    const logout = (e:any)=>{
        axios.get('http://localhost:8000/user/logout') 
        .then((response) => {
            localStorage.removeItem('token');
            localStorage.clear();
            navigate('../')
        })
    }

    useEffect(()=>{
        axios.get('http://localhost:8000/user/', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
        })
        .then(res => {
            setLastName(res.data.last_name)
            setFirstName(res.data.first_name)
            setSearchParams({ title: titleName });
            
        }).catch((error)=>{
            alert('異常登入')
        });
        },[titleName, setSearchParams]);

    return (
        <>
            <div className="flex flex-col h-screen overflow-auto w-screen">
                <div className='w-full h-28 bg-slate-600 flex px-5 items-center overflow-auto'>
                    <pre className='w-1/6 text-4xl text-white'>{titleName}</pre>
                    <pre className='bg-gray-200 p-2 w-4/6 text-m text-black'>Welcome!   {last_name} {first_name}</pre>
                    <div className='w-1/5 flex justify-end items-center'>
                        <button className=' bg-red-600 w-20 h-10 rounded-3xl text-white text-m border-2 shadow-m hover:bg-red-800' onClick={(e)=>{logout(e)}}>
                            登出
                        </button>
                    </div>
                </div>
                <div className="w-full h-screen flex overflow-auto" >
                    <div className='w-1/6 h-full flex flex-col bg-gray-300 shadow-2-xl px-5 overflow-auto'>
                        <Card title={'统计信息'} onClick={()=>{navigate('/user/index?title=' + encodeURIComponent('統計信息')); setTitle('統計信息')}}/>
                        <Card title={'地圖'} onClick={()=>{navigate('/user/map?title=' + encodeURIComponent('地圖')); setTitle('地圖')}}/>
                        {/*<Card title={'地圖'} onClick={()=>{navigate('./map'); setTitle('地圖')}}/>*/}
                        <Card title={'個人信息'} onClick={()=>{navigate('/user/personal?title=' + encodeURIComponent('個人信息')); setTitle('個人信息')}}/>
                        <Card title={'設備管理'} onClick={()=>{navigate('../deviceManager'); setTitle('設備管理')}}/>
                    </div>
                    <Outlet />
                </div>
            </div>
        </>
    );
}

export function Card(props:PropsWithChildren<Props>){

    return(
        <div className=" w-full h-20 flex justify-center items-center border-4 my-8 bg-white 
        rounded-m shadow-l border-gray-100 hover:bg-slate-200 hover:border-slate-400 cursor-pointer"  onClick={() => props.onClick()}>
            <p className="font-bold">{props.title}</p>
        </div>
    );
}