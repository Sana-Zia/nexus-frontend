import { useEffect, useState } from "react";
import axios from "axios";

interface Meeting {
  id: number;
  title: string;
  status: string;
}

export default function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const token = localStorage.getItem("access");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/meetings/", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => setMeetings(res.data));
  }, []);

  const updateStatus = (id: number, status: string) => {
    axios.patch(
      `http://127.0.0.1:8000/api/meetings/${id}/`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    ).then(() => alert("Meeting updated"));
  };

  return (
    <div>
      <h2>Meetings</h2>

      {meetings.map(m => (
        <div key={m.id}>
          <p>{m.title} - {m.status}</p>

          <button onClick={() => updateStatus(m.id, "accepted")}>
            Accept
          </button>

          <button onClick={() => updateStatus(m.id, "rejected")}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}
