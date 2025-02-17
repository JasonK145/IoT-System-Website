import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DeviceData {
  clientName: string;
  clientType: string;
  alert: number;
  clientId: string;
  info: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  value: number;
}


export default function Index() {
  const navigate = useNavigate();  
  const [username, setUsername] = useState<string | null>(null);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [editDeviceId, setEditDeviceId] = useState<number | null>(null);
  const [editedClientInfo, setEditedClientInfo] = useState<{ clientName: string; clientId: string; clientType: string; info: string; latitude: number; longitude: number; value: number; alert: number }>({ 
    clientName:'', clientId: '', clientType:'', info: '', latitude:30.0, longitude:120.0, value:0, alert:0 });

  const fetchDevices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/getDevice/'); // 你的API端点
      setDevices(response.data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const createDevice = async (newDevice: DeviceData) => {
    try {
      const response = await axios.post('http://localhost:8000/device/CreateDevice/', newDevice);
      setDevices([...devices, response.data]);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // 打印出后端返回的错误信息
        console.error('Error creating device:', error.response.data);
      } else {
        // 打印出其他类型的错误信息
        console.error('Error creating device:', error);
      }
    }
  };

  const deleteDevice = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/device/${id}/delete/`);
      setDevices(devices.filter((device) => device.timestamp !== id));
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  useEffect(() => {
    fetchDevices();
    axios.get('http://localhost:8000/user/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => {
      setUsername(res.data.username);
    });
  }, []); 

  const handleEditChange = (name: keyof typeof editedClientInfo, value: string) => {
    setEditedClientInfo((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (device: DeviceData) => {
    try {
      const response = await axios.put(`http://localhost:8000/device/${device.timestamp}/update/`, {
        clientId: editedClientInfo.clientId,
        clientName: editedClientInfo.clientName,
        info: editedClientInfo.info,
        clientType: editedClientInfo.clientType,
        latitude: editedClientInfo.latitude,
        longitude: editedClientInfo.longitude,
        value: editedClientInfo.value,
        alert: editedClientInfo.alert,
      });
      // 更新本地状态
      setDevices((prev) =>
        prev.map((d) => (d.timestamp === device.timestamp ? { ...d, ...response.data } : d))
      );
      setEditDeviceId(null); // 退出编辑状态
    } catch (error) {
      console.error('Error saving device:', error);
    }
  };

  return (
    <div className="w-5/6 p-6 h-full bg-gray-100">
        {username && <div className='flex justify-between p-2 mb-4'>
            <p className="text-3xl font-bold">Device List</p>
            <button className='bg-red-600 w-28 h-12 rounded-3xl text-white text-m border-2 shadow-sm hover:bg-red-800 shadow-red-600 hover:pointer' 
            onClick={() => createDevice({ 
                alert: 0,
                clientId: 'device ' + getCurrentFormattedTime() + " " + randomNumber(),
                clientName: 'Map' + randomNumber(),
                clientType: 'Map Device',
                info: 'Device Data: ' + getCurrentFormattedTime(),
                latitude: 30.0,
                longitude: 120.0,
                timestamp: Date.now(),
                value: 0
            })}>
            Add Device
            </button>
        </div>}
        {username && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
            <div key={device.timestamp} className="p-4 shadow-xl rounded-lg bg-white">
                {editDeviceId === device.timestamp ? (
                <>
                    <div className='flex flex-col'>
                    <input
                        className="text-xl font-semibold"
                        value={editedClientInfo.clientName}
                        onChange={(e) => handleEditChange('clientName', e.target.value)}
                        type="text"
                    />
                    <input
                        value={editedClientInfo.clientId}
                        onChange={(e) => handleEditChange('clientId', e.target.value)}
                        type="text"
                    />
                    <input
                        value={editedClientInfo.info}
                        onChange={(e) => handleEditChange('info', e.target.value)}
                        type="text"
                    />
                    <input
                        value={editedClientInfo.clientType}
                        onChange={(e) => handleEditChange('clientType', e.target.value)}
                        type="text"
                    />
                    <input
                        value={editedClientInfo.latitude}
                        onChange={(e) => handleEditChange('latitude', e.target.value)}
                        type="text"
                    />
                    <input
                        value={editedClientInfo.longitude}
                        onChange={(e) => handleEditChange('longitude', e.target.value)}
                        type="text"
                    />
                    <input
                        value={editedClientInfo.value}
                        onChange={(e) => handleEditChange('value', e.target.value)}
                        type="text"
                    />
                    <input
                        value={editedClientInfo.alert}
                        onChange={(e) => handleEditChange('alert', e.target.value)}
                        type="text"
                    />
                    </div>
                    <div className='flex justify-between mt-1'>
                        <button className='bg-lime-400 rounded-2xl py-1 px-2 text-white border-2 shadow-sm shadow-lime-400 hover:bg-lime-700 hover:pointer' onClick={() => saveEdit(device)}>Save</button>
                        <button className='bg-red-400 rounded-2xl py-1 px-2 text-white border-2 shadow-sm shadow-red-400 hover:bg-red-700 hover:pointer' onClick={() => setEditDeviceId(null)}>Cancel</button>
                    </div>
                </>
                ) : (
                <>
                    <h2 className="text-xl font-semibold">{device.clientName}</h2>
                    <p>ID: {device.clientId}</p>
                    <p>Status: {device.info}</p>
                    <p>Type: {device.clientType}</p>
                    <p>latitude: {device.latitude}</p>
                    <p>longitude: {device.longitude}</p>
                    <p>value: {device.value}</p>
                    <p>alert: {device.alert}</p>

                    <div className='flex justify-between mt-1'>
                    <button className='bg-lime-400 rounded-2xl py-1 px-2 text-white border-2 shadow-sm shadow-lime-400 hover:hover:bg-lime-700 hover:pointer' onClick={() => {
                        setEditDeviceId(device.timestamp);
                        setEditedClientInfo({clientName:device.clientName, clientId: device.clientId, clientType: device.clientType, info: device.info, latitude: device.latitude, longitude:device.longitude, value:device.value, alert:device.alert });
                        }}>Edit
                    </button>
                    <button className='bg-red-400 rounded-2xl py-1 px-2 text-white border-2 shadow-sm shadow-red-400 hover:bg-red-700 hover:pointer' onClick={() => deleteDevice(device.timestamp)}>Delete</button>
                    </div>
                </>
                )}
            </div>
            ))}
        </div>}

    </div>
  );
}

function getCurrentFormattedTime(): string {
  const currentDateTime = new Date();

  const year = currentDateTime.getFullYear();
  const month = (currentDateTime.getMonth() + 1).toString().padStart(2, '0'); // 月份是从0开始的
  const day = currentDateTime.getDate().toString().padStart(2, '0');

  const hours = currentDateTime.getHours().toString().padStart(2, '0');
  const minutes = currentDateTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentDateTime.getSeconds().toString().padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

function randomNumber(): string{
  const min = 10;
  const max = 10000;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return `${randomNumber}`
}