"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  ChartOptions,
  ChartData,
} from 'chart.js';

import { FiMenu } from 'react-icons/fi'; // Import menu icon from react-icons
import useServiceWorker from '@/hooks/useServiceWorker';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface SensorData {
  gas_mq9b: number;
  humidity_th22: number;
  altitude_bmp180: number;
  pressure_bmp180: number;
  temperature_th22: number;
  temperature_bmp180: number;
}

function HomePage() {
  useServiceWorker();

  const [data, setData] = useState<SensorData | null>(null);

  // State to store user-defined limits for each parameter (default to null)
  const [limits, setLimits] = useState<{ [key in keyof SensorData]: number | null }>({
    gas_mq9b: null,
    humidity_th22: null,
    altitude_bmp180: null,
    pressure_bmp180: null,
    temperature_th22: null,
    temperature_bmp180: null,
  });

  // State for request rate in seconds
  const [requestRate, setRequestRate] = useState<number | null>(10); // Default to 10 seconds

  // State to manage the visibility of the settings panel
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Reference to store the interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Map parameter keys to user-friendly labels
  const parameterLabels: { [key in keyof SensorData]: string } = {
    gas_mq9b: 'Gas Level',
    humidity_th22: 'Humidity',
    altitude_bmp180: 'Altitude',
    pressure_bmp180: 'Pressure',
    temperature_th22: 'Temperature (TH22)',
    temperature_bmp180: 'Temperature (BMP180)',
  };

  // Define units for each parameter
  const parameterUnits: { [key in keyof SensorData]: string } = {
    gas_mq9b: 'ppm',        // Parts per million
    humidity_th22: '%',     // Percentage
    altitude_bmp180: 'm',   // Meters
    pressure_bmp180: 'hPa', // Hectopascals
    temperature_th22: '°C', // Degrees Celsius
    temperature_bmp180: '°C', // Degrees Celsius
  };

  // Function to fetch data
  const fetchData = async () => {
    try {
      // Fetch data from the ESP32 device
      const response = await fetch('http://192.168.0.1/sensors');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const sensorData: SensorData = await response.json();

      /*
      // Sample data (commented out)
      const sensorData: SensorData = {
        gas_mq9b: 79,
        humidity_th22: 85,
        altitude_bmp180: 47,
        pressure_bmp180: 94,
        temperature_th22: 13,
        temperature_bmp180: 9,
      };
      */

      setData(sensorData);

      // Check for any parameter exceeding the limit
      (Object.keys(sensorData) as Array<keyof SensorData>).forEach((key) => {
        const value = sensorData[key];
        const limit = limits[key];
        if (limit !== null && value > limit) {
          // Show a notification
          if (Notification.permission === "granted") {
            new Notification("Danger", {
              body: `Parameter ${parameterLabels[key]} exceeded the limit: ${value}`,
              // icon: '/path/to/icon.png', // Add a path to an icon if desired
            });
          }
        }
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    // Request permission to send notifications
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // Initial fetch
    fetchData();

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up interval if requestRate is valid and greater than 0
    if (requestRate && requestRate > 0) {
      intervalRef.current = setInterval(fetchData, requestRate * 1000);
    }

    return () => {
      // Clear interval on component unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [limits, requestRate]); // Added requestRate to dependency array

  if (!data) {
    return <div>Loading...</div>;
  }

  // Define unique colors for each parameter
  const colorPalette: { [key in keyof SensorData]: string } = {
    gas_mq9b: '#FF6384',           // Pink
    humidity_th22: '#36A2EB',      // Blue
    altitude_bmp180: '#FFCE56',    // Yellow
    pressure_bmp180: '#4BC0C0',    // Teal
    temperature_th22: '#9966FF',   // Purple
    temperature_bmp180: '#FF9F40', // Orange
  };

  // For each parameter, create a Doughnut chart
  const parameters = Object.keys(data) as (keyof SensorData)[];

  return (
    <div className="p-5 max-w-full box-border font-sans relative">
      {/* Hamburger Menu */}
      <button
        className="absolute top-6 left-5 text-2xl"
        onClick={() => setShowSettings(true)}
      >
        <FiMenu />
      </button>

      {/* Show request rate at the top */}
      <div className="absolute top-20 left-20 text-center text-lg mb-2">
        <span className='text-green-400'>Request Rate:</span> {requestRate !== null && requestRate > 0 ? `${requestRate} seconds` : 'Manual'}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-5 w-4/5 max-w-md">
            <h2 className="text-xl text-black font-bold mb-4">Settings</h2>
            <label className="block mb-4">
              <span className="text-gray-700">Request Rate (seconds):</span>
              <input
                type="number"
                value={requestRate !== null ? requestRate : ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue === '') {
                    setRequestRate(null);
                  } else {
                    const newRate = Number(newValue);
                    setRequestRate(newRate);
                  }
                }}
                className="mt-1 block w-full text-black p-2 border rounded appearance-none"
                placeholder="Enter seconds or leave empty for manual"
              />
            </label>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              onClick={() => setShowSettings(false)}
            >
              Save
            </button>
            <button
              className="bg-gray-300 text-black px-4 py-2 rounded"
              onClick={() => setShowSettings(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <h1 className="text-center text-2xl mb-5 font-bold">
        Smart <span className='text-yellow-300'>Mining</span> Hat
      </h1>
      <div className="flex flex-col mt-16">
        {parameters.map((param, index) => {
          const value = data[param];
          const color = colorPalette[param];
          const label = parameterLabels[param];
          const unit = parameterUnits[param];

          const isDanger = limits[param] !== null && value > limits[param];

          const chartData: ChartData<'doughnut'> = {
            labels: [label, 'Remaining'],
            datasets: [
              {
                data: [value, 100 - value],
                backgroundColor: [color, '#e0e0e0'],
                hoverBackgroundColor: [color, '#d0d0d0'],
                borderWidth: 0, // Removed border
              },
            ],
          };

          const options: ChartOptions<'doughnut'> = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.label || '';
                    const dataValue = context.parsed;
                    return `${label}: ${dataValue}${unit}`;
                  },
                },
              },
              title: {
                display: true,
                text: `${label}: ${value}${unit}`,
                font: {
                  size: 16,
                },
                color: '#FFFFFF',
              },
            },
            cutout: '80%', // Adjust the doughnut's inner radius
          };

          return (
            <div
              key={param}
              className={`flex flex-col items-center p-5 ${
                index !== parameters.length - 1 ? 'border-b border-gray-300' : ''
              }`}
            >
              <div className="w-40 h-40 relative">
                <Doughnut data={chartData} options={options} />
              </div>
              <div className={`mt-8 text-center p-2 rounded-lg  ${isDanger ? 'bg-red-500 text-white' : ''}`}>
                <label className="text-xs">
                  Danger Limit:
                  <input
                    type="number"
                    value={limits[param] !== null ? limits[param] : ''}
                    onChange={(e) => {
                      const newLimit = e.target.value ? Number(e.target.value) : null;
                      setLimits((prevLimits) => ({
                        ...prevLimits,
                        [param]: newLimit,
                      }));
                    }}
                    className="ml-2 w-16 p-1 border rounded text-black text-center appearance-none"
                    placeholder="None"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center mt-5">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            // Manually fetch data
            fetchData();
          }}
        >
          Refresh
        </button>
      </div>

      {/* Add custom CSS to remove number input arrows */}
      <style jsx global>{`
        /* Hide number input spinners */
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type='number'] {
          -moz-appearance: textfield; /* Firefox */
        }
      `}</style>
    </div>
  );
}

export default HomePage;
