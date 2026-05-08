import React, { useEffect, useState } from "react"
import axios from "axios"

export default function NotificationPanel() {

    const [notifications, setNotifications] = useState([])

    const token = localStorage.getItem("token")

    useEffect(() => {

        loadNotifications()

    }, [])

    const loadNotifications = async () => {

        const res = await axios.get(
            "http://localhost:5000/api/notifications",
            { headers: { Authorization: `Bearer ${token}` } }
        )

        setNotifications(res.data)

    }

    return (

        <div className="bg-slate-900 p-6 rounded-xl">

            <h3 className="text-xl mb-4">Notifications</h3>

            {notifications.map(n => (
                <div className="border-b border-slate-800 py-2">
                    {n.message}
                </div>
            ))}

        </div>

    )

}