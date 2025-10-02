import { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: Date;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() => targetDate.getTime() - new Date().getTime());

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = targetDate.getTime() - new Date().getTime();
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const getTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  };

  const { days, hours, minutes, seconds } = getTime(timeLeft);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '3px',
      fontSize: '3rem',
      fontWeight: 'bold',
      color: '#E0218A',
      marginTop: '20px',
      marginBottom: '20px',
      backgroundColor: 'white',
      width: '80vw',
      height: '15vh',
      alignItems: 'center',
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(225, 33, 138, 0.6)'
    }}
>
      <div>{days}:</div>
      <div>{hours}:</div>
      <div>{minutes}:</div>
      <div>{seconds}</div>
    </div>
  );
}
