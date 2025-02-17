import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
// 引入图标文件
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// 定义传入组件的数据项类型
interface MqttDataItem {
  alert: number;
  client_id: string;
  info: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  value: number;
}

// 定义组件接受的 props 类型
interface MapComponentProps {
  mqttData: MqttDataItem[];
}
interface LatLng {
    lat: number;
    lng: number;
}


const MapComponent: React.FC<MapComponentProps> = ({ mqttData }) => {
    const colors = ["blue", "red", "green", "yellow", "purple", "orange", "cyan", "magenta", "lime", "pink", "teal", "lavender", "brown", "beige", "maroon", "mint", "olive", "coral", "navy", "grey", "white", "black"];
    const [markers, setMarkers] = useState<LatLng[]>([]);


    useEffect(() => {
        // 确保这个代码块只在客户端执行
        if (typeof window !== 'undefined') {
        // 条件性导入 Leaflet
        const L = require('leaflet');

        const alertIcon = new L.Icon({
            iconUrl: '/images/alert.png', // 提供告警图标的路径
            iconSize: [50, 50],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          
        const normalIcon = new L.Icon({
            iconUrl: L.Icon.Default.prototype.options.iconUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        // 设置默认图标的路径
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: markerIcon2x,
            iconUrl: markerIcon,
            shadowUrl: markerShadow,
        });

        // 确保地图容器在初始化之前是清空的
        const mapContainer = L.DomUtil.get('map');
        if (mapContainer != null && mapContainer._leaflet_id != null) {
            delete mapContainer._leaflet_id; // or set it to null
        }

        // 初始化地图
        const map = L.map('map').setView([30.32586, 120.2948], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

      // 监听地图点击事件
        let maxClientId: number
        axios.get('http://localhost:8000/getMaxClientId/')
        .then(response => {
            maxClientId = response.data.deviceCount;
            console.log(maxClientId)
        })
        .catch(error => {
            console.error('There was an error getting the max clientId:', error);
        });
        
        
        map.on('click', function(e:any) {
            // 创建新标记
            maxClientId += 1
            const newMarker = L.marker(e.latlng).addTo(map);
            const newClientId = 'device ' + getCurrentFormattedTime() + " " + maxClientId
            const newMarkerInfo = 'Device Data: ' + getCurrentFormattedTime()
            
            // 创建发送到后端的数据对象
            const newMarkerData = {
                clientId: newClientId,
                clientName: 'Map '+ randomNumber() + ' add on Map', 
                clientType: 'Map Device',
                info: newMarkerInfo, 
                timestamp: Date.now(),
                latitude: e.latlng.lat,
                longitude: e.latlng.lng,
                value: randomNumber(),
                alert:0
            };
            
            axios.post('http://localhost:8000/CreateDeviceMQTT/', newMarkerData)
            .then(response => {
                console.log('Device added successfully:', response.data);
                // 更新状态以包含新标记
                setMarkers(prevMarkers => [
                ...prevMarkers,
                newMarker
                ]);
                // 在新标记上显示弹窗
                newMarker.bindPopup(`${newClientId}: (${newMarkerData.latitude.toFixed(6)}, ${newMarkerData.longitude.toFixed(6)}) <br/>` + newMarkerInfo).openPopup();
            })
            .catch(error => {
                console.error('There was an error adding the device:', error);
            });
        });
        

        mqttData.forEach(dataItem => {
            const markerIcon = dataItem.alert !== 0 ? alertIcon : normalIcon;

            L.marker([dataItem.latitude, dataItem.longitude], {icon: markerIcon})
            .addTo(map)
            .bindPopup(`${dataItem.client_id}: (${(dataItem.latitude).toFixed(6)}, ${dataItem.longitude.toFixed(6)}) <br/>` + dataItem.info);
        });

        mqttData.forEach((device, index) => {
            axios.get(`http://localhost:8000/device-history/${device.client_id}`)
                .then(response => {
                    const deviceHistory = response.data;
        
                    // 检查设备历史是否为数组并且每个元素都有lat和lng属性
                    if (Array.isArray(deviceHistory) && deviceHistory.every(entry => 'lat' in entry && 'lng' in entry)) {
                        if (deviceHistory.length > 1) {
                            const color = colors[index % colors.length];
        
                            const start = { lat: deviceHistory[0].lat, lng: deviceHistory[0].lng };
                            const end = { lat: deviceHistory[deviceHistory.length - 1].lat, lng: deviceHistory[deviceHistory.length - 1].lng };
        
                            fetchRoute(start, end, color);
                        }
                    } else {
                        console.error('Device history is invalid or an entry does not have lat or lng properties', deviceHistory);
                    }
                })
                .catch(error => {
                    console.error('获取设备位置历史数据时出错:', error);
                });
        });
        
        const fetchRoute = (start:any, end:any, color:any) => {
            const accessToken = 'pk.eyJ1IjoiamFzb25hbyIsImEiOiJjbHF3YzBnMzMwMWFjMmlvMnc5a2IzOTM0In0.oLNNwQHs-ILPQ2Plic0fIg'; // 替换为你的Mapbox access token
            //const accessToken = ''
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&access_token=${accessToken}`;
        
            axios.get(url)
                .then(response => {
                    const route = response.data.routes[0].geometry.coordinates;
                    const latlngs = route.map((coord:any) => [coord[1], coord[0]]);
                    L.polyline(latlngs, { color: color }).addTo(map);
                })
                .catch(error => {
                    console.error('Error fetching route:', error);
                });
        };

            return () => {
                map.off('click');
                map.remove();
            };
        }
    }, [mqttData]);
    

    return <div id="map" style={{ height: '700px', width: '100%' }} />;
};

export default MapComponent;

function getCurrentFormattedTime(): string {
    const currentDateTime = new Date();
  
    const year = currentDateTime.getFullYear();
    const month = (currentDateTime.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDateTime.getDate().toString().padStart(2, '0');
  
    const hours = currentDateTime.getHours().toString().padStart(2, '0');
    const minutes = currentDateTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentDateTime.getSeconds().toString().padStart(2, '0');
  
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  }

  function randomNumber(): number{
    const min = 0;
    const max = 1000;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber
  }