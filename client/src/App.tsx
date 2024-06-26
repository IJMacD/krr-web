import React, { useEffect, useState } from 'react'
import './App.css'
import { RecommendationResult } from './types';
import { ScanResults } from './ScanResults';
import { ErrorBoundary } from './ErrorBoundary';
import { SimulatedProgressBar } from './SimulatedProgressBar';

type DataSource = "live" | "file"

function App() {
  const [data, setData] = useState(null as RecommendationResult | null)
  const [dataSource, setDataSource] = useState("live" as DataSource)
  const [error, setError] = useState(null as Error | null)

  useEffect(() => {
    if (dataSource === "live") {
      let current = true;

      function run() {
        fetch("/recommended")
          .then(r => r.json())
          .then(d => {
            if (current) {
              setData(d);
            }
          })
          .catch(setError);
      }

      run();

      const id = setInterval(run, 5 * 60 * 1000);

      return () => { current = false; clearInterval(id); }
    }
  }, [dataSource]);

  function handleFileInput(e: React.FormEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (file) {
      setDataSource("file");

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        if (typeof (reader.result) === "string") {
          try {
            setData(JSON.parse(reader.result) as RecommendationResult);
          }
          catch (e) {
            setData(null);
          }
        }
      })
      reader.readAsText(file, "utf-8");

      e.currentTarget.value = "";
    }
  }

  return (
    <>
      <h1>krr-web</h1>
      <div>
        <label>
          <input type="radio" name="data-source" checked={dataSource === "live"} onChange={e => e.target.checked && setDataSource("live")} />
          Live
        </label>
        <label>
          <input type="radio" name="data-source" checked={dataSource === "file"} onChange={e => e.target.checked && setDataSource("file")} />
          File
        </label>
      </div>
      {dataSource === "file" && <input type="file" onChange={handleFileInput} accept=".json" />}

      {error ?
        <>
          <h2>Erorr loading Data</h2>
          <p>{error.message}</p>
        </> :
        <>
          {dataSource === "live" && !data && <p>Loading...<SimulatedProgressBar estimatedDuration={30 * 1000} /></p>}

          <ErrorBoundary>
            {data && <ScanResults results={data} />}
          </ErrorBoundary>
        </>
      }
    </>
  )
}

export default App
