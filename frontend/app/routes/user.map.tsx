// pages/index.js 或任何其他页面文件

import axios from "axios";
import dynamic from 'next/dynamic.js';
import { useEffect, useState } from 'react';

// Leaflet CSS
import 'leaflet/dist/leaflet.css';

const MapWithNoSSR = dynamic(
  () => import('./components/MapComponent'), 
  {
    ssr: false,
    loading: () => <p>Loading... Please Wait a Minute!</p>, 
  }
);

interface MqttDataItem {
  alert: string;
  client_id: string;
  info: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  value: number;
}

export default function Index() {
  const [username, setUsername] = useState<string | null>(null);
  const [mqttData, setMqttData] = useState<MqttDataItem[]>([]);
  
  // 可以创建一个用于获取token的函数
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem('token');
    }
    return null;
  };

  useEffect(() => {
    // 获取用户信息
    const fetchUserData = async (token: string | null) => {
      if (!token) return;
      try {
        const response = await axios.get('http://localhost:8000/user/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsername(response.data.username);
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    // 获取 MQTT 数据
    const fetchMqttData = async (token: string | null) => {
      if (!token) return;
      try {
        const response = await axios.get('http://localhost:8000/api/device-data/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setMqttData(response.data); // 假设返回的是一个数组
      } catch (error) {
        console.error("Error fetching MQTT data: ", error);
      }
    };

    const token = getToken();
    fetchUserData(token);
    fetchMqttData(token);
  }, []);

  return (
    <div className="w-5/6 p-6 h-full bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-xl h-full">
        {username && <p>用户名: {username}</p>}
        {username && <MapWithNoSSR mqttData={mqttData}/>}
      </div>
    </div>
  );
}