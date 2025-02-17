import { Input } from 'antd';
import axios from "axios";
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

interface Props{
    title: string,
    type: string,
    user:string,
}

export default function Index(){
    const [username, setUsername] = useState('');
    const [first_name, setFirstName] = useState();
    const [last_name, setLastName] = useState();
    const [email, setEmail] = useState();
    const [age, setAge] = useState();
    const [major, setMajor] = useState();
    const [phone, setPhone] = useState();
    
    const fetchUserData = async() =>{
        try{
            const res = await axios.get('http://localhost:8000/user/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUsername(res.data.username);
            setFirstName(res.data.first_name);
            setLastName(res.data.last_name);
            setEmail(res.data.email);
            setAge(res.data.age);
            setMajor(res.data.major);
            setPhone(res.data.phone);
        }
        catch(error){
            console.error('Error fetching userdata:', error);
        }
    }
    
    useEffect(()=>{
        fetchUserData()
    },[]);


    return(
        <div className="py-5 px-12 w-5/6 h-full flex flex-col bg-gray-100 shadow-2xl">
            <div className="w-full h-5/6">
                <pre className="font-semibold text-3xl pt-3 pb-4 border-b-4 border-slate-600 text-slate-600 mb-6">基础信息</pre>
                <PersonCard title = '名字：' type='first_name' user={username}>{first_name}</PersonCard>
                <PersonCard title = '姓氏：' type='last_name' user={username}>{last_name}</PersonCard>
                <PersonCard title = '用戶名：' type='username' user={username}>{username}</PersonCard>
                <PersonCard title = "年齡：" type='age' user={username}>{age}</PersonCard>
                <PersonCard title = "Email：" type='email' user={username}>{email}</PersonCard>
                <PersonCard title = '專業：' type='major' user={username}>{major}</PersonCard>
                <PersonCard title = '手機號：' type='phone' user={username}>{phone}</PersonCard>
            </div>
        </div>
    );
}

export function PersonCard(props:PropsWithChildren<Props>){
    const [isChanged, setIsChanged] = useState(false);
    const [value, setValue] = useState('');
    const textInput = props.children;
    const upload = async (e:any) => {
        axios.post("http://localhost:8000/UserUpload/", {
            type: props.type,
            value: value,
            user: props.user,
          })
          .then((res) => { 
            location.reload()
          });
    }

    return(
        <div className="h-14 flex mb-4 text-lg items-center">
            <div className="w-4/5 flex items-center">
                <div className="w-40">
                    <pre className=" text-lg font-semibold">{props.title}</pre>
                </div>
                <div className="w-full flex items-center">
                {!isChanged && <pre>{props.children}</pre>}
                {isChanged && <Input
                    type="text"
                    className=""
                    size="large"
                    placeholder={textInput ? String(textInput) : ''}
                    onChange={(e:any)=>{setValue(e.target.value)}}/>}
                </div>
            </div>
            <div className="w-1/5 flex justify-end px-5">
                {!isChanged && <button className="text-red-600 text-base hover:text-red-800" onClick={()=>{setIsChanged(!isChanged)}}>修改</button>}
                {isChanged && 
                    <button className="text-blue-600 text-base hover:text-blue-900" 
                    onClick={(e:any)=>{setIsChanged(!isChanged); 
                        upload(e);
                    }}>確認</button>
                }
            </div>
        </div>
    );
}