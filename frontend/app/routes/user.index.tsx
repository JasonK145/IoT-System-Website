import axios from 'axios';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import 'chart.js/auto'; // 自动注册chart.js组件
import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';

interface DeviceData {
  alert: number;
  clientId: string;
  info: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  value: number;
}

ChartJS.register(ArcElement, Tooltip, Legend);

const Index = () => {
  // 使用 useState Hook 管理状态
  const [username, setUsername] = useState<string | null>(null);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [maxClientId, setMaxClientId] = useState<number | null>(null);
  const totalDeviceValue = devices.reduce((total, device) => total + device.value, 0);
  const totalAlerts = devices.reduce((total, device) => {
    return device.alert > 0 ? total + 1 : total;
  }, 0);

  // 获取设备数据
  const fetchDevices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/getDevice/');
      setDevices(response.data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  // 获取最大的 clientId
  const fetchMaxDevices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/getMaxClientId/');
      setMaxClientId(response.data.deviceCount);
    } catch (error) {
      console.error('Error fetching number of devices:', error);
    }
  };

  // 获取用户名
  const fetchUsername = async () => {
    try {
      const response = await axios.get('http://localhost:8000/user/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsername(response.data.username);
    } catch (error) {
      console.error('Error fetching username:', error);
    }
  };

  // 使用 useEffect Hook 在组件加载时执行数据获取
  useEffect(() => {
    fetchDevices();
    fetchMaxDevices();
    fetchUsername();
  }, []);

  // 准备图表数据
  const data = {
    labels: devices.map(device => device.clientId),
    datasets: [
      {
        data: devices.map(device => device.value),
        backgroundColor: [
          '#FF6384', // 红色
          '#36A2EB', // 蓝色
          '#FFCE56', // 黄色
          '#4BC0C0', // 青色
          '#F77825', // 橙色
          '#9966FF', // 紫色
          '#C9CB3A', // 橄榄绿
          '#7E57C2', // 深紫色
          '#EA80FC', // 浅紫色
          '#00E676', // 亮绿色
        ],
        hoverBackgroundColor: [
          '#E55A74', // 红色 - 深色
          '#2E86C1', // 蓝色 - 深色
          '#E6B045', // 黄色 - 深色
          '#3A7A7A', // 青色 - 深色
          '#D66513', // 橙色 - 深色
          '#7E5EFF', // 紫色 - 深色
          '#A0A329', // 橄榄绿 - 深色
          '#5D3FBF', // 深紫色 - 深色
          '#C560FC', // 浅紫色 - 深色
          '#00C853', // 亮绿色 - 深色
        ],
      },
    ],
  };

  // 图表选项配置
  const options = {
    cutout: '50%',
    responsive: true,
    plugins: {
      title:{
        display: true,
        text: '接收的数据量圖表',
        color: '#FF6384',
        font:{
          size: '24',
        }
      },
      legend: {
        position: 'top',
        labels: {
          padding: 10,
        },
      },
      tooltip: {
        enabled: true,
        cornerRadius: 10,
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 12,
        },
      },
    },
    interaction: {
      mode: 'point',
      intersect: false,
    },
    hover: {
      mode: 'point',
      onHover: (event:any, chartElement:any) => {
        const target = event.native ? event.native.target : event.target;
        target.style.cursor = chartElement.length ? 'pointer' : 'default';
      },
    },
  };

  return (
<div className='w-5/6 p-6 h-full bg-gray-100 flex flex-col justify-center items-center'>
  {username && (
    <div className=' px-28 py-6 rounded-2xl shadow-xl h-auto bg-white m-4 w-full'>
      
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-center'>
        <div className="p-4 bg-gray-200 rounded-lg shadow-sm">
          <p className="font-bold text-xl">{maxClientId}</p>
          <p>设备总量</p>
        </div>
        
        <div className="p-4 bg-gray-200 rounded-lg shadow-sm">
          <p className="font-bold text-xl">{totalDeviceValue}</p>
          <p>接收的数据总量</p>
        </div>

        <div className="p-4 bg-gray-200 rounded-lg shadow-sm">
          <p className="font-bold text-xl">{totalAlerts}</p>
          <p>警报总量</p>
        </div>
      </div>
      
      <div className='flex justify-center mt-6' style={{height: '600px'}}>
        <Pie data={data} options={options} style={{ cursor: 'pointer' }} />
      </div>
    </div>
  )}
</div>
  );
};

// 默认导出组件
export default Index;