import { useEffect, useState } from "react";
import {
    addProgressPhoto,
    getProgressPhotos,
} from "../api";

function ProgressPhotos() {
    const [photoUrl, setPhotoUrl] = useState("");
    const [photoType, setPhotoType] = useState("front");
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState("");

    async function loadPhotos() {
        try {
            const data = await getProgressPhotos();
            setPhotos(data);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadPhotos();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            await addProgressPhoto({
                photo_url: photoUrl,
                photo_type: photoType,
                notes: "",
            });

            setPhotoUrl("");
            loadPhotos();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div>
            <h2>Progress Photos</h2>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Photo URL"
                    value={photoUrl}
                    onChange={(e) =>
                        setPhotoUrl(e.target.value)
                    }
                    required
                />

                <select
                    value={photoType}
                    onChange={(e) =>
                        setPhotoType(e.target.value)
                    }
                >
                    <option value="front">Front</option>
                    <option value="side">Side</option>
                    <option value="back">Back</option>
                </select>

                <button type="submit">
                    Save Photo
                </button>
            </form>

            <div>
                {photos.map((photo) => (
                    <div key={photo.id}>
                        <p>
                            {photo.date} — {photo.photo_type}
                        </p>

                        <img
                            src={photo.photo_url}
                            alt="Progress"
                            width="200"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProgressPhotos;