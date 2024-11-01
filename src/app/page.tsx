'use client';

import styles from "./page.module.css";
import LineChart from "./components/LineChart";
import DonutChart from "./components/DonutChart";
import LeadsLoansChart from "./components/LeadLoansChart"

export default function Home() {

  return (
    <div className={styles.page}>
      <div className={styles.chartsContainer}>
       
        <LeadsLoansChart />

        <div className="line-container">
          <LineChart />
        </div>
              
        <div className="donut-container">
          <DonutChart />
        </div>
      </div>
    </div>
  );
}
