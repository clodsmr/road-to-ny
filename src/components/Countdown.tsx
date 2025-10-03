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
        justifyContent: 'center',   // orizzontale
        alignItems: 'center',       // verticale
        width: '75%',               // occupa tutta la larghezza del contenitore
        maxWidth: 400,               // limiti massimi su tablet/desktop
        margin: '1rem auto',         // centra in orizzontale
        padding: '15px',
        gap: '8px',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#E0218A',
        backgroundColor: 'white',
        borderRadius: 15,
        boxShadow: '0 4px 20px rgba(225, 33, 138, 0.6)',
        height: '12vh'
        }}>


      <div>{days > 10 ? days : `0${days}`}:</div>
      <div>{hours > 10 ? hours : `0${hours}`}:</div>
      <div>{minutes > 10 ? minutes : `0${minutes}`}:</div>
      <div>{seconds > 10 ? seconds : `0${seconds}`}</div>
    </div>
  );
}
