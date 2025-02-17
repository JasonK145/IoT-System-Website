import { Input } from 'antd';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AButton from './components/AButton';

export default function Index(){
  const navigate = useNavigate();
  const [id, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = (e:any) => {
    // Check account's length is six digit or not
    if(id.length < 6){
      alert("用戶名必須至少有6個字節!");
      return;
    }
    // Check password's length is six digit or not
    if(password.length < 6){
      alert("密碼必須至少有6個字節!");
      return;
    }
    // Check email format
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(id)) {
      alert("請輸入有效的電子郵件地址!");
      return;
    }
    
    axios.post("http://localhost:8000/api/login/", {
        id: id,
        password: password,
      })
      .then((res) => { 
        if(res.data.message == "Successful login!"){
          alert('登入成功！');
          localStorage.setItem('token', res.data.token)
          console.log(res.data)
          navigate('./user/index');
        }
        else{
          alert('登入失敗！');
        }
          
      });
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-[url('/images/kasei.jpeg')] bg-no-repeat bg-cover bg-center">
      <div className="w-3/5 px-40 bg-center bg-no-repeat h-3/4 flex flex-col justify-center">
        <div className="border-2 p-5 bg-white rounded-2xl shadow-2xl">
          <p className="mt-5 text-3xl text-center font-semibold">Login Page</p>
          <div className="flex flex-col items-center mt-10">
            <div className="w-4/5 text-center">
              <Input
                className="my-4 "
                size="large"
                placeholder="Account"
                onChange={(e)=>{setUsername(e.target.value)}}/>
              <Input
                type="password"
                className="my-4 mb-7 "
                size="large"
                placeholder="Password"
                onChange={(e)=>{setPassword(e.target.value)}}/>
              <AButton onClick={(e:any)=>{login(e)}} >登入</AButton>
            </div>
          </div>
        </div>
        <div className="my-10 border-2 p-5 bg-white rounded-2xl shadow-2xl">
          <div className="flex justify-center">
            <p className="w-24">沒有帳號？</p>
            <a href="/createAcc" className="text-blue-400 underline">注冊</a>
          </div>
          <div className="flex justify-center mt-3">
            <p className="w-24">忘記密碼？</p>
            <a href="/forgot" className="text-blue-400 underline">重設</a>
          </div>
        </div>
      </div>
    </div>
  );
}