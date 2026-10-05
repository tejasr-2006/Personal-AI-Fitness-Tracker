import { useState } from "react";
import { sendCoachMessage } from "../api";

function AICoach() {
    const [message, setMessage] = useState("");
    const [conversation, setConversation] = useState([]);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!message.trim()) {
            return;
        }

        const userMessage = message;

        setConversation((previous) => [
            ...previous,
            {
                role: "user",
                text: userMessage,
            },
        ]);

        setMessage("");
        setLoading(true);

        try {
            const result =
                await sendCoachMessage(userMessage);

            setConversation((previous) => [
                ...previous,
                {
                    role: "assistant",
                    text: result.response,
                },
            ]);
        } catch (error) {
            setConversation((previous) => [
                ...previous,
                {
                    role: "assistant",
                    text: error.message,
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h2>AI Fitness Coach</h2>

            <div>
                {conversation.map((message, index) => (
                    <div key={index}>
                        <strong>
                            {message.role === "user"
                                ? "You"
                                : "AI Coach"}
                        :
                        </strong>

                        <p>{message.text}</p>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Ask your fitness coach..."
                    value={message}
                    onChange={(e) =>
                        setMessage(e.target.value)
                    }
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Thinking..."
                        : "Send"}
                </button>
            </form>
        </div>
    );
}

export default AICoach;