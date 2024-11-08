"use client";

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SensorData {
  id: number;
  gas_mq9b: number;
  humidity_th22: number;
  altitude_bmp180: number;
  pressure_bmp180: number;
  temperature: number;

}

// Sample data generator (simulates one sensor data at a time)
const generateSampleData = () => ({
  id: 1,
  gas_mq9b: Math.floor(Math.random() * 100),
  humidity_th22: Math.floor(Math.random() * 100),
  altitude_bmp180: Math.floor(Math.random() * 100),
  pressure_bmp180: Math.floor(Math.random() * 100),
  temperature: Math.floor(Math.random() * 100),

});

export default function HomePage() {
  const [data, setData] = useState<SensorData>(generateSampleData());

  useEffect(() => {
    // Request permission to send notifications
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // Update the sample data every 10 seconds
    const intervalId = setInterval(() => {
      const newData = generateSampleData();
      setData(newData);

      // Check if any sensor value exceeds 80 and show a notification if so
      if (
        newData.gas_mq9b > 80 ||
        newData.humidity_th22 > 80 ||
        newData.altitude_bmp180 > 80 ||
        newData.pressure_bmp180 > 80 ||
        newData.temperature > 80
      ) {
        // Show a notification when any value exceeds 80
        if (Notification.permission === "granted") {
          new Notification("Danger", {
            body: `A sensor value exceeded the threshold!`,
            icon: '/path/to/icon.png', // Add a path to an icon if desired
          });
        }
      }
    }, 10000);

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  // Prepare data for the chart
  const chartData = {
    labels: [`ID ${data.id}`], // Only display the current ID on the X-axis
    datasets: [
      {
        label: 'Gas MQ9B',
        data: [data.gas_mq9b],
        backgroundColor: 'rgba(255, 99, 132, 1)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Humidity TH22',
        data: [data.humidity_th22],
        backgroundColor: 'rgba(54, 162, 235, 1)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Altitude BMP180',
        data: [data.altitude_bmp180],
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pressure BMP180',
        data: [data.pressure_bmp180],
        backgroundColor: 'rgba(153, 102, 255, 1)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
      {
        label: 'Temperature',
        data: [data.temperature],
        backgroundColor: 'rgba(255, 159, 64, 1)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },

    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 8, // Reduce font size for mobile devices
          },
        },
      },
      title: {
        display: true,
        text: 'Simulated ESP32 Sensor Data',
        font: {
          size: 18,
        },
      },
    },
  };

  return (
    <div style={{ padding: '20px', maxWidth: '100%', boxSizing: 'border-box' }}>
      <h1>ESP32 Sensor Data (Simulated)</h1>
      <div style={{ width: '100%', height: '400px', maxWidth: '600px', margin: '0 auto' }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
