import { useEffect, useState } from "react";
import {
    getNotifications,
    generateNotifications,
    markNotificationRead,
} from "../api";

function Notifications() {
    const [notifications, setNotifications] =
        useState([]);

    const [error, setError] = useState("");

    async function loadNotifications() {
        try {
            const data =
                await getNotifications();

            setNotifications(data);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadNotifications();
    }, []);

    async function generate() {
        try {
            await generateNotifications();
            await loadNotifications();
        } catch (err) {
            setError(err.message);
        }
    }

    async function markRead(id) {
        try {
            await markNotificationRead(id);
            await loadNotifications();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div>
            <h2>Notifications</h2>

            <button onClick={generate}>
                Check for Alerts
            </button>

            {error && <p>{error}</p>}

            {notifications.length === 0 && (
                <p>No notifications.</p>
            )}

            {notifications.map((item) => (
                <div key={item.id}>
                    <strong>
                        {item.title}
                    </strong>

                    <p>
                        {item.message}
                    </p>

                    {!item.is_read && (
                        <button
                            onClick={() =>
                                markRead(item.id)
                            }
                        >
                            Mark as Read
                        </button>
                    )}

                    <hr />
                </div>
            ))}
        </div>
    );
}

export default Notifications;