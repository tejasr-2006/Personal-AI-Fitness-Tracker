import { useState } from "react";
import {
    getWeeklyReport,
    getMonthlyReport,
} from "../api";

function Reports() {
    const [report, setReport] = useState(null);
    const [type, setType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadReport(reportType) {
        setLoading(true);
        setError("");
        setType(reportType);

        try {
            const result =
                reportType === "weekly"
                    ? await getWeeklyReport()
                    : await getMonthlyReport();

            setReport(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h2>AI Progress Reports</h2>

            <button
                onClick={() => loadReport("weekly")}
                disabled={loading}
            >
                Weekly Report
            </button>

            <button
                onClick={() => loadReport("monthly")}
                disabled={loading}
            >
                Monthly Report
            </button>

            {loading && (
                <p>
                    Generating {type} report...
                </p>
            )}

            {error && <p>{error}</p>}

            {report && (
                <div>
                    <h3>
                        {report.title ||
                            `${type} Report`}
                    </h3>

                    <p>
                        {report.summary}
                    </p>

                    {report.achievements && (
                        <>
                            <h4>
                                Achievements
                            </h4>

                            {report.achievements.map(
                                (item, index) => (
                                    <p key={index}>
                                        • {item}
                                    </p>
                                )
                            )}
                        </>
                    )}

                    {report.areas_to_improve && (
                        <>
                            <h4>
                                Areas to Improve
                            </h4>

                            {report.areas_to_improve.map(
                                (item, index) => (
                                    <p key={index}>
                                        • {item}
                                    </p>
                                )
                            )}
                        </>
                    )}

                    {report.recommendations && (
                        <>
                            <h4>
                                Recommendations
                            </h4>

                            {report.recommendations.map(
                                (item, index) => (
                                    <p key={index}>
                                        • {item}
                                    </p>
                                )
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default Reports;